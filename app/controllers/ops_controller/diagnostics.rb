# Diagnosticsapiversion Accordion methods included in OpsController.rb
module OpsController::Diagnostics
  extend ActiveSupport::Concern

  def diagnostics_tree_select
    assert_privileges("ops_diagnostics")

    typ, id = params[:id].split("-")
    case typ
    when "svr"
      @record = MiqServer.find(id)
    when "role"
      @record = ServerRole.find(id)
      @rec_status = @record.assigned_server_roles.find_by(:active => true) ? "active" : "stopped" if @record.class == ServerRole
    when "asr"
      @record = AssignedServerRole.find(id)
      @rec_status = @record.assigned_server_roles.find_by(:active => true) ? "active" : "stopped" if @record.class == ServerRole
    end
    @sb[:diag_selected_model] = @record.class.to_s
    @sb[:diag_selected_id] = @record.id
    refresh_screen
  end

  def restart_server
    assert_privileges("restart_server")
    begin
      svr = MiqServer.find(@sb[:selected_server_id])
      svr.restart_queue
    rescue => bang
      add_flash(_("Error during 'Appliance restart': %{message}") % {:message => bang.message}, :error)
    else
      audit = {:event        => "restart_server",
               :message      => "Server '#{svr.name}' restarted",
               :target_id    => svr.id,
               :target_class => "MiqServer",
               :userid       => session[:userid]}
      AuditEvent.success(audit)
      add_flash(_("%{product} Appliance restart initiated successfully") % {:product => Vmdb::Appliance.PRODUCT_NAME})
    end
    javascript_flash(:spinner_off => true)
  end

  def pm_restart_workers
    assert_privileges("restart_workers")
    @refresh_partial = "#{@sb[:active_tab]}_tab"
    worker = MiqWorker.find(checked_or_params.first)
    wtype = worker.normalized_type
    begin
      svr = MiqServer.find(@sb[:selected_server_id])
      worker.restart
    rescue => bang
      add_flash(_("Error during 'workers restart': %{message}") % {:message => bang.message}, :error)
    else
      audit = {:event        => "restart_workers",
               :message      => "Worker on Server '#{svr.name}' restarted",
               :target_id    => svr.id,
               :target_class => "MiqWorker",
               :userid       => session[:userid]}
      AuditEvent.success(audit)
      add_flash(_("'%{type}' Worker restart initiated successfully") % {:type => wtype})
    end
    @refresh_partial = "layouts/gtl"
    pm_get_workers
    replace_right_cell(:nodetype => x_node)
  end
  alias restart_workers pm_restart_workers

  def pm_refresh_workers
    assert_privileges("refresh_workers")
    @lastaction = "refresh_workers"
    @refresh_partial = "layouts/gtl"
    pm_get_workers
    replace_right_cell(:nodetype => x_node)
  end
  alias refresh_workers pm_refresh_workers

  def log_depot_edit
    assert_privileges("#{@sb[:selected_typ] == "miq_server" ? "" : "zone_"}log_depot_edit")
    @record = @sb[:selected_typ].classify.constantize.find(@sb[:selected_server_id])
    # @schedule = nil # setting to nil, since we are using same view for both db_back and log_depot edit
    case params[:button]
    when "cancel"
      @in_a_form = false
      @edit = session[:edit] = nil
      add_flash(_("Edit Log Depot settings was cancelled by the user"))
      diagnostics_set_form_vars
      replace_right_cell(:nodetype => x_node)
    when "save"
      if @flash_array
        javascript_flash(:spinner_off => true)
        return
      end

      begin
        if params[:log_protocol].blank?
          @record.log_file_depot.try(:destroy)
        else
          new_uri = "#{params[:uri_prefix]}://#{params[:uri]}"
          raise _("Unsupported log depot protocol: %{protocol}") % {:protocol => params[:log_protocol]} unless FileDepot.supported_depots.key?(params[:log_protocol])

          build_supported_depots_for_select
          log_protocol = params[:log_protocol]
          protocols = FileDepot.supported_depots.map { |k, _v| [k, k.constantize] }.to_h
          raise _('Invalid or unsupported file depot type.') unless protocols.key?(log_protocol)

          depot = @record.log_file_depot.instance_of?(protocols[log_protocol]) ? @record.log_file_depot : @record.build_log_file_depot(:type => log_protocol)
          depot.update(:uri => new_uri, :name => params[:depot_name])
          creds = set_credentials
          depot.update_authentication(creds) if protocols[log_protocol].try(:requires_credentials?)
          @record.save!
        end
      rescue => bang
        add_flash(_("Error during 'Save': %{message}") % {:message => bang.message}, :error)
        @changed = true
        render :update do |page|
          page << javascript_prologue
          page.replace_html("diagnostics_collect_logs", :partial => "ops/log_collection")
        end
      else
        add_flash(_("Log Depot Settings were saved"))
        @edit = nil
        diagnostics_set_form_vars
        replace_right_cell(:nodetype => x_node)
      end
    when "validate"
      creds = set_credentials
      settings = {
        :username => creds[:default][:userid],
        :password => creds[:default][:password],
        :uri      => "#{params[:uri_prefix]}://#{params[:uri]}"
      }

      begin
        log_protocol = params[:log_protocol]
        protocols = FileDepot.supported_depots.map { |k, _v| [k, k.constantize] }.to_h
        raise _("Unsupported log depot protocol: %{protocol}") % {:protocol => log_protocol} unless protocols.key?(log_protocol)

        protocols[log_protocol].validate_settings(settings)
      rescue => bang
        add_flash(_("Error during 'Validate': %{message}") % {:message => bang.message}, :error)
      else
        add_flash(_("Log Depot Settings were validated"))
      end
      javascript_flash(:spinner_off => true)
    when nil # Reset or first time in
      @in_a_form = true
      replace_right_cell(:nodetype => "log_depot_edit")
    end
  end

  # Send the log in text format
  def fetch_log
    assert_privileges("fetch_log")
    disable_client_cache
    send_data(fetch_local_log("evm"), :filename => "evm.log")
    AuditEvent.success(:userid => session[:userid], :event => "download_evm_log", :message => "EVM log downloaded")
  end

  # Send the audit log in text format
  def fetch_audit_log
    assert_privileges("fetch_audit_log")
    disable_client_cache
    send_data(fetch_local_log("audit"), :filename => "audit.log")
    AuditEvent.success(:userid  => session[:userid],
                       :event   => "download_audit_log",
                       :message => "Audit log downloaded")
  end

  # Send the production log in text format
  def fetch_production_log
    assert_privileges("fetch_production_log")
    disable_client_cache
    send_data(fetch_local_log(Rails.env), :filename => "#{Rails.env}.log")
    AuditEvent.success(:userid  => session[:userid],
                       :event   => "download_#{Rails.env}_log",
                       :message => "#{@sb[:rails_log]} log downloaded")
  end

  def refresh_log
    assert_privileges("refresh_log")
    @log = Vmdb::Loggers.contents($log)
    @selected_server = MiqServer.find(x_node.split("-").last.to_i)
    add_flash(_("Logs for this %{product} Server are not available for viewing") % Vmdb::Appliance.PRODUCT_NAME, :warning) if @log.blank?
    render :update do |page|
      page << javascript_prologue
      page.replace_html("diagnostics_evm_log", :partial => "diagnostics_evm_log_tab")
      page << "miqSparkle(false);"  # Need to turn off sparkle in case original ajax element gets replaced
    end
  end

  def refresh_audit_log
    assert_privileges("refresh_audit_log")
    @log = Vmdb::Loggers.contents($audit_log)
    @selected_server = MiqServer.find(x_node.split("-").last.to_i)
    add_flash(_("Logs for this %{product} Server are not available for viewing") % Vmdb::Appliance.PRODUCT_NAME, :warning) if @log.blank?
    render :update do |page|
      page << javascript_prologue
      page.replace_html("diagnostics_audit_log", :partial => "diagnostics_audit_log_tab")
      page << "miqSparkle(false);"  # Need to turn off sparkle in case original ajax element gets replaced
    end
  end

  def refresh_production_log
    assert_privileges("refresh_production_log")
    @log = Vmdb::Loggers.contents($rails_log)
    @selected_server = MiqServer.find(x_node.split("-").last.to_i)
    add_flash(_("Logs for this %{product} Server are not available for viewing") % Vmdb::Appliance.PRODUCT_NAME, :warning) if @log.blank?
    render :update do |page|
      page << javascript_prologue
      page.replace_html("diagnostics_production_log", :partial => "diagnostics_production_log_tab")
      page << "miqSparkle(false);"  # Need to turn off sparkle in case original ajax element gets replaced
    end
  end

  def cu_repair_field_changed
    assert_privileges("ops_diagnostics")

    return unless load_edit("curepair_edit__new", "replace_cell__explorer")

    @selected_server = Zone.find(@sb[:selected_server_id])
    cu_repair_get_form_vars
    render :update do |page|
      page << javascript_prologue
      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page << "miqScrollTop();" if @flash_array.present?
      page.replace_html("diagnostics_cu_repair", :partial => "diagnostics_cu_repair_tab")
      page << "ManageIQ.calendar.calDateFrom = null;"
      page << "ManageIQ.calendar.calDateTo = new Date();"
      page << "miqBuildCalendar();"
      page << if @edit[:new][:start_date] == "" || @edit[:new][:end_date] == ""
                javascript_for_miq_button_visibility(false)
              else
                javascript_for_miq_button_visibility(true)
              end
      page << "miqSparkle(false);"
    end
  end

  def cu_repair
    assert_privileges("ops_diagnostics")

    if params[:end_date].to_time < params[:start_date].to_time
      render :json => {:status => :error, :message => _("End Date cannot be earlier than Start Date")}
    else
      # converting string to time, and then converting into user selected timezone
      from = "#{params[:start_date]} #{params[:start_hour]}:#{params[:start_min]}:00".to_time.in_time_zone(params[:timezone])
      to = "#{params[:end_date]} #{params[:end_hour]}:#{params[:end_min]}:00".to_time.in_time_zone(params[:timezone])
      selected_zone = Zone.find(x_node.split('-').last)
      begin
        Metric::Capture.perf_capture_gap_queue(from, to, selected_zone)
      rescue => bang
        # Push msg and error flag
        render :json => {:status => :error, :message => _("Error during 'C & U Gap Collection': %{message}") % {:message => bang.message}}
      else
        render :json => {:status => :success, :message => _("C & U Gap Collection successfully initiated")}
      end
    end
  end

  def log_collection_form_fields
    assert_privileges("#{@sb[:selected_typ] == "miq_server" ? "" : "zone_"}log_depot_edit")
    @record = @sb[:selected_typ].classify.constantize.find(@sb[:selected_server_id])
    log_depot = @record.log_file_depot
    log_depot_json = log_depot ? build_log_depot_json(log_depot) : build_empty_log_depot_json
    render :json => log_depot_json
  end

  def build_log_depot_json(log_depot)
    prefix, uri = log_depot[:uri].to_s.split('://')
    klass = @record.log_file_depot.try(:class)

    log_depot_json = {:depot_name   => log_depot[:name],
                      :uri          => uri,
                      :uri_prefix   => prefix,
                      :log_userid   => log_depot.authentication_userid,
                      :log_protocol => klass.to_s}
    log_depot_json
  end

  def build_empty_log_depot_json
    log_depot_json = {:depot_name   => '',
                      :uri          => '',
                      :uri_prefix   => '',
                      :log_userid   => '',
                      :log_password => '',
                      :log_protocol => ''}
    log_depot_json
  end

  def diagnostics_server_list
    assert_privileges("ops_diagnostics_server_view")

    @lastaction = "diagnostics_server_list"
    @force_no_grid_xml = true
    if x_node.split("-").first == "z"
      zone = Zone.find(x_node.split("-").last)
      @view, @pages = get_view(MiqServer, :named_scope => [[:with_zone_id, zone.id]]) # Get the records (into a view) and the paginator
    else
      @view, @pages = get_view(MiqServer, :named_scope => [:in_my_region]) # Get the records (into a view) and the paginator
    end
    @no_checkboxes = @showlinks = true
    @items_per_page = ApplicationController::ONE_MILLION
    @current_page = @pages[:current] unless @pages.nil? # save the current page number

    update_gtl_div('diagnostics_server_list') if pagination_or_gtl_request?
  end

  private ############################

  def fetch_local_log(*params)
    if MiqEnvironment::Command.supports_systemd?
      fetch_journal_log(*params)
    elsif !MiqEnvironment::Command.is_podified?
      fetch_log_file(*params)
    end
  end

  def fetch_journal_log(service_name = nil, max_count = 1_000, filter_params = {})
    return unless MiqEnvironment::Command.supports_systemd?

    filter_params[:syslog_identifier] = service_name if service_name.present?

    require "systemd/journal"
    Systemd::Journal.open do |journal|
      journal.filter(filter_params)

      entries = max_count.nil? ? journal.all : journal.take(max_count)
      entries.map do |entry|
        # This is the time in microseconds since the epoch UTC, formatted as a decimal string.
        seconds_since_epoch = entry._source_realtime_timestamp.to_f / 1_000_000.0
        timestamp = Time.zone.at(seconds_since_epoch).strftime("%Y-%m-%dT%H:%M:%S.%6N")

        "[#{timestamp} ##{entry._pid}]#{entry.message}"
      end.join("\n")
    end
  end

  def fetch_log_file(service_name, max_count = 1_000)
    log = case service_name
          when "evm"
            $log
          when "audit"
            $audit_log
          when Rails.env
            $rails_log
          end

    Vmdb::Loggers.contents(log, max_count)
  end

  def cu_repair_set_form_vars
    @timezone_offset = get_timezone_offset
    @in_a_form = true
    @edit ||= {}
    @edit[:new] ||= {}
    @edit[:key] = "curepair_edit__new"
    @edit[:new][:start_hour] = "00"
    @edit[:new][:start_min] = "00"
    # @edit[:new][:start_date] = "#{f.month}/#{f.day}/#{f.year}" # Set the start date
    @edit[:new][:start_date] = ""

    @edit[:new][:end_hour] = "23"
    @edit[:new][:end_min] = "59"
    # @edit[:new][:end_date] = "#{t.month}/#{t.day}/#{t.year}" # Set the start date
    @edit[:new][:end_date] = ""

    @edit[:new][:timezone] = ::Settings.server.timezone
  end

  def cu_repair_get_form_vars
    @edit[:new][:timezone] = params[:cu_repair_tz] if params[:cu_repair_tz]
    @edit[:new][:start_date] = params[:miq_date_1] if params[:miq_date_1]
    @edit[:new][:end_date] = params[:miq_date_2] if params[:miq_date_2]
    if @edit[:new][:start_date] != "" && (@edit[:new][:end_date] == "" || @edit[:new][:end_date].to_time < @edit[:new][:start_date].to_time)
      @edit[:new][:end_date] = @edit[:new][:start_date]
    end
  end

  # Collect the current logs from the selected zone or server
  def logs_collect(options = {})
    options[:support_case] = params[:support_case] if params[:support_case]
    obj, id = x_node.split("-")
    assert_privileges("#{obj == "z" ? "zone_" : ""}collect_logs")
    klass = obj == "svr" ? MiqServer : Zone
    instance = @selected_server = klass.find(id.to_i)
    if !instance.active?
      add_flash(_("Cannot start log collection, requires a started server"), :error)
    elsif instance.log_collection_active_recently?
      add_flash(_("Cannot start log collection, a log collection is already in progress within this scope"), :error)
    else
      begin
        options[:context] = klass.name
        instance.synchronize_logs(session[:userid], options)
      rescue => bang
        add_flash(_("Log collection error returned: %{error_message}") % {:error_message => bang.message}, :error)
      else
        add_flash(_("Log collection for %{product} %{object_type} %{name} has been initiated") % {:product => Vmdb::Appliance.PRODUCT_NAME, :object_type => klass.name, :name => instance.display_name})
      end
    end
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node)
  end

  # Reload the selected node and redraw the screen via ajax
  def refresh_server_summary
    assert_privileges("refresh_server_summary")
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node)
  end

  def pm_get_workers
    @lastaction = "pm_workers_list"
    @force_no_grid_xml = true
    @no_checkboxes = false
    @embedded = @pages = false
    @showlinks = true
    status = %w[started ready working]

    view_options = {
      :named_scope => [[:with_miq_server_id, @sb[:selected_server_id]],
                       [:with_status, status]],
      # passing all_pages option to show all records on same page
      :all_pages   => true,
      :clickable   => false,
    }
    @view, @pages = get_view(MiqWorker, view_options)

    # setting @embedded and @pages to nil, we don't want to show sorting/paging bar on the screen'
    @embedded = @pages = nil
  end

  def role_start
    assert_privileges("role_start")
    if @sb[:diag_selected_model] != "AssignedServerRole"
      add_flash(_("Start is not allowed for the selected item"), :error)
    else
      asr = AssignedServerRole.find(@sb[:diag_selected_id])
      begin
        asr.activate_in_role_scope
      rescue => bang
        add_flash(bang, :error)
      else
        add_flash(_("Start successfully initiated"))
      end
    end
    refresh_screen
  end

  def role_suspend
    assert_privileges("role_suspend")
    if @sb[:diag_selected_model] != "AssignedServerRole"
      add_flash(_("Suspend is not allowed for the selected item"), :error)
    else
      asr = AssignedServerRole.find(@sb[:diag_selected_id])
      begin
        asr.deactivate_in_role_scope
      rescue => bang
        add_flash(bang, :error)
      else
        add_flash(_("Suspend successfully initiated"))
      end
    end
    refresh_screen
  end

  # Delete selected server
  def delete_server
    assert_privileges("delete_server")
    if @sb[:diag_selected_id].nil?
      add_flash(_("EVM Server no longer exists"), :error)
    else
      server = MiqServer.find_by(:id => @sb[:diag_selected_id])
      process_server_deletion(server) if server
    end
    add_flash(_("The selected EVM Server was deleted")) if @flash_array.nil?
    refresh_screen
  end

  def process_server_deletion(server)
    server.destroy
  rescue => bang
    add_flash(_("Server \"%{name}\": Error during 'destroy': ") % {:name => server.name} << bang.message,
              :error)
  else
    AuditEvent.success(
      :event        => "svr_record_delete",
      :message      => "[#{server.name}] Record deleted",
      :target_id    => server.id,
      :target_class => "MiqServer",
      :userid       => session[:userid]
    )
    add_flash(_("Server \"%{name}\": Delete successful") % {:name => "#{server.name} [#{server.id}]"})
  end

  def promote_server
    assert_privileges("promote_server")
    if @sb[:diag_selected_model] != "AssignedServerRole"
      add_flash(_("Setting priority is not allowed for the selected item"), :error)
    else
      asr = AssignedServerRole.find(@sb[:diag_selected_id])
      begin
        asr.set_priority(asr.priority - 1)
      rescue => bang
        add_flash(bang, :error)
      else
        priority = if asr.priority == 1
                     'primary'
                   elsif asr.priority == 2
                     'secondary'
                   else
                     'normal'
                   end
        add_flash(_("%{product} Server \"%{name}\" set as %{priority} for Role \"%{role_description}\"") % {:name => asr.miq_server.name, :priority => priority, :role_description => asr.server_role.description, :product => Vmdb::Appliance.PRODUCT_NAME})
      end
    end
    refresh_screen
  end

  def demote_server
    assert_privileges("demote_server")
    if @sb[:diag_selected_model] != "AssignedServerRole"
      add_flash(_("Setting priority is not allowed for the selected item"), :error)
    else
      asr = AssignedServerRole.find(@sb[:diag_selected_id])
      begin
        asr.set_priority(asr.priority + 1)
      rescue => bang
        add_flash(bang, :error)
      else
        priority = if asr.priority == 1
                     'primary'
                   elsif asr.priority == 2
                     'secondary'
                   else
                     'normal'
                   end
        add_flash(_("%{product} Server \"%{name}\" set as %{priority} for Role \"%{role_description}\"") % {:name => asr.miq_server.name, :priority => priority, :role_description => asr.server_role.description, :product => Vmdb::Appliance.PRODUCT_NAME})
      end
    end
    refresh_screen
  end

  # Reload the selected node and redraw the screen via ajax
  def refresh_screen
    @explorer = true
    if params[:pressed] == "delete_server" || params[:pressed] == "zone_delete_server"
      @sb[:diag_selected_id] = nil
      build_replaced_trees(%i[settings diagnostics], %i[settings diagnostics])
    end
    parent = if x_node == "root"
               MiqRegion.my_region
             else
               Zone.find(x_node.split('-').last)
             end
    @selected_server = parent if params[:action] == "x_button"
    build_server_tree(parent)
    render :update do |page|
      page << javascript_prologue
      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page << "miqScrollTop();" if @flash_array.present?
      page.replace("selected_#{@sb[:active_tab].split('_').last}_div", :partial => "selected")
      #   Replace tree
      if params[:pressed] == "delete_server"
        page.replace("settings_tree_div", :partial => "tree", :locals => {:name => "settings_tree"})
        page.replace("diagnostics_tree_div", :partial => "tree", :locals => {:name => "diagnostics_tree"})
        nodes = x_node.split("-")
        nodes.pop
        page << "miqTreeActivateNodeSilently('<%= x_active_tree %>', '<%= x_node %>');"
      end
      if params[:action] == "x_button"
        page.replace("zone_tree_div", :partial => "zone_tree")
      end

      if center_toolbar_filename.present?
        page << "$('#toolbar').show();"
        page << javascript_reload_toolbars
      else
        page << "$('#toolbar').hide();"
      end
    end
  end

  # Reload the selected node and redraw the screen via ajax
  def reload_server_tree
    assert_privileges("reload_server_tree")
    parent = x_node == "root" ? MiqRegion.my_region : Zone.find(x_node.split('-').last)
    build_server_tree(parent)
    render :update do |page|
      page << javascript_prologue
      #   Replace tree
      page.replace("selected_#{@sb[:active_tab].split('_').last}_div", :partial => "selected")
    end
  end

  def diagnostics_set_form_vars
    active_node = x_node
    if active_node && active_node.split('-').first == "z"
      @record = @selected_server = Zone.find_by(:id => active_node.split('-').last)
      @sb[:selected_server_id] = @selected_server.id
      @sb[:selected_typ] = "zone"
      if @selected_server.miq_servers.length >= 1 &&
         %w[diagnostics_roles_servers diagnostics_servers_roles].include?(@sb[:active_tab])
        build_server_tree(@selected_server)
      else
        @server_tree = nil
      end
      cu_repair_set_form_vars if @sb[:active_tab] == "diagnostics_cu_repair"
      diagnostics_server_list if @sb[:active_tab] == "diagnostics_server_list"
      @right_cell_text = if my_zone_name == @selected_server.name
                           _("Diagnostics %{model} \"%{name}\" (current)") %
                             {:name  => @selected_server.description,
                              :model => ui_lookup(:model => @selected_server.class.to_s)}
                         else
                           _("Diagnostics %{model} \"%{name}\"") %
                             {:name  => @selected_server.description,
                              :model => ui_lookup(:model => @selected_server.class.to_s)}
                         end
    elsif x_node == "root"
      if @sb[:active_tab] == "diagnostics_zones"
        @zones = Zone.visible.in_my_region
      elsif %w[diagnostics_roles_servers diagnostics_servers_roles].include?(@sb[:active_tab])
        @selected_server = MiqRegion.my_region
        @sb[:selected_server_id] = @selected_server.id
        @sb[:selected_typ] = "miq_region"
        if @selected_server.miq_servers.length >= 1
          build_server_tree(@selected_server)
        else
          @server_tree = nil
        end
      elsif @sb[:active_tab] == "diagnostics_replication" # Replication tab
        @selected_server = MiqRegion.my_region
      elsif @sb[:active_tab] == "diagnostics_database"
        database_details
      elsif @sb[:active_tab] == "diagnostics_server_list"
        diagnostics_server_list
      end
      @right_cell_text = _("Diagnostics Region \"%{name}\"") %
                         {:name => "#{MiqRegion.my_region.description} [#{MiqRegion.my_region.region}]"}
    elsif active_node && active_node.split('-').first == "svr"
      @selected_server ||= MiqServer.find(@sb[:selected_server_id]) # Reread the server record
      if @sb[:selected_server_id] == my_server.id
        if @sb[:active_tab] == "diagnostics_evm_log"
          @log = fetch_local_log("evm")
          add_flash(_("Logs for this %{product} Server are not available for viewing") % {:product => Vmdb::Appliance.PRODUCT_NAME}, :warning) if @log.blank?
          @msg_title = _("ManageIQ")
          @refresh_action = "refresh_log"
          @download_action = "fetch_log"
        elsif @sb[:active_tab] == "diagnostics_audit_log"
          @log = fetch_local_log("audit")
          add_flash(_("Logs for this %{product} Server are not available for viewing") % {:product => Vmdb::Appliance.PRODUCT_NAME}, :warning) if @log.blank?
          @msg_title = _("Audit")
          @refresh_action = "refresh_audit_log"
          @download_action = "fetch_audit_log"
        elsif @sb[:active_tab] == "diagnostics_production_log"
          @log = fetch_local_log(Rails.env)
          add_flash(_("Logs for this %{product} Server are not available for viewing") % {:product => Vmdb::Appliance.PRODUCT_NAME}, :warning) if @log.blank?
          @msg_title = @sb[:rails_log]
          @refresh_action = "refresh_production_log"
          @download_action = "fetch_production_log"
        elsif @sb[:active_tab] == "diagnostics_summary"
          @selected_server = MiqServer.find(@sb[:selected_server_id])
        elsif @sb[:active_tab] == "diagnostics_workers"
          pm_get_workers
          @record = @selected_server
        else
          @record = @selected_server = MiqServer.find(x_node.split("-").last.to_i)
          @sb[:selected_server_id] = @selected_server.id
          @sb[:selected_typ] = "miq_server"
        end
      elsif @sb[:selected_server_id] == my_server.id || @selected_server.started?
        if @sb[:active_tab] == "diagnostics_workers"
          pm_get_workers
          @record = @selected_server
        else
          @selected_server = MiqServer.find(x_node.split("-").last.to_i)
          @sb[:selected_server_id] = @selected_server.id
          @sb[:selected_typ] = "miq_server"
        end
      else
        @sb[:active_tab] = "diagnostics_collect_logs" # setting it to show collect logs tab as first tab for the servers that are not started
        @record = @selected_server = MiqServer.find(x_node.split("-").last.to_i)
        @sb[:selected_server_id] = @selected_server.id
        @sb[:selected_typ] = "miq_server"
      end
      @right_cell_text = if my_server.id == @sb[:selected_server_id]
                           _("Diagnostics %{model} \"%{name}\" (current)") %
                             {:name  => "#{@selected_server.name} [#{@selected_server.id}]",
                              :model => ui_lookup(:model => @selected_server.class.to_s)}
                         else
                           _("Diagnostics %{model} \"%{name}\"") %
                             {:name  => "#{@selected_server.name} [#{@selected_server.id}]",
                              :model => ui_lookup(:model => @selected_server.class.to_s)}
                         end
    end
  end

  # Method to build the server tree (parent is a zone or region instance)
  def build_server_tree(parent)
    @server_tree = if @sb[:diag_tree_type] == "roles"
                     TreeBuilderRolesByServer.new(:roles_by_server_tree, @sb, true, :root => parent)
                   else
                     TreeBuilderServersByRole.new(:servers_by_role_tree, @sb, true, :root => parent)
                   end
    if @sb[:diag_selected_id]
      @record = @sb[:diag_selected_model].constantize.find(@sb[:diag_selected_id]) # Set the current record
      @rec_status = @record.assigned_server_roles.find_by(:active => true) ? "active" : "stopped" if @record.class == ServerRole
    end
  end

  # Get information for a node
  def diagnostics_get_info
    @in_a_form = false
    node = x_node.downcase.split("-").first
    case node
    when "root"
      @sb[:diag_tree_type] ||= "roles"
      @sb[:diag_selected_id] = nil
      diagnostics_set_form_vars
    when "z"
      @sb[:diag_tree_type] ||= "roles"
      @sb[:diag_selected_id] = nil
      diagnostics_set_form_vars
    when "svr"
      @record = @selected_server = MiqServer.find(x_node.downcase.split("-").last)
      @sb[:selected_server_id] = @selected_server.id
      diagnostics_set_form_vars
    end
  end

  def build_supported_depots_for_select
    not_supported_depots = %w[FileDepotS3 FileDepotSwift]
    supported_depots = FileDepot.supported_depots.reject { |model, _desc| not_supported_depots.include?(model) }
    @uri_prefixes = supported_depots.keys.map { |model| [model, model.constantize.uri_prefix] }.to_h
    @supported_depots_for_select = {'' => _('<No Depot>')}.merge(supported_depots)
  end

  def set_credentials
    creds = {}
    if params[:log_userid]
      log_password = params[:log_password] || @record.log_file_depot.authentication_password
      creds[:default] = {:userid => params[:log_userid], :password => log_password}
    end
    creds
  end
end
