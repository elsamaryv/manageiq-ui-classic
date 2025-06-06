module OpsController::Settings::Common
  extend ActiveSupport::Concern
  include OpsHelper

  logo_dir = File.expand_path(File.join(Rails.root, "public/upload"))
  Dir.mkdir(logo_dir) unless File.exist?(logo_dir)
  @@logo_file = File.join(logo_dir, "custom_logo.png")
  @@login_logo_file = File.join(logo_dir, "custom_login_logo.png")
  @@login_brand_file = File.join(logo_dir, "custom_brand.png")
  @@favicon_file = File.join(logo_dir, "custom_favicon.ico")

  # AJAX driven routine to check for changes in ANY field on the form
  def settings_form_field_changed
    assert_privileges("ops_settings")

    settings_get_form_vars
    return unless @edit

    @assigned_filters = []
    case @sb[:active_tab] # Server, DB edit forms
    when 'settings_server', 'settings_authentication',
         'settings_custom_logos'
      @changed = (@edit[:new] != @edit[:current])
      if params[:console_type]
        @refresh_div     = 'settings_server' # Replace main area
        @refresh_partial = 'settings_server_tab'
      end
    when 'settings_advanced' # Advanced yaml edit
      @changed = (@edit[:new] != @edit[:current])
    end

    render :update do |page|
      page << javascript_prologue
      page.replace_html(@refresh_div, :partial => @refresh_partial) if @refresh_div

      case @sb[:active_tab]
      when 'settings_server'
        if @test_email_button
          page << javascript_hide("email_verify_button_off")
          page << javascript_show("email_verify_button_on")
        else
          page << javascript_hide("email_verify_button_on")
          page << javascript_show("email_verify_button_off")
        end

        if @smtp_auth_none
          page << javascript_disable_field('smtp_user_name')
          page << javascript_disable_field('smtp_password')
        else
          page << javascript_enable_field('smtp_user_name')
          page << javascript_enable_field('smtp_password')
        end

        if @changed || @login_text_changed
          page << javascript_hide_if_exists("server_options_on")
          page << javascript_show_if_exists("server_options_off")
        else
          page << javascript_hide_if_exists("server_options_off")
          page << javascript_show_if_exists("server_options_on")
        end
      when 'settings_authentication'
        if @authmode_changed
          if %w[ldap ldaps].include?(@edit[:new][:authentication][:mode])
            page << javascript_show("ldap_div")
            page << javascript_show("ldap_role_div")
            page << javascript_show("ldap_role_div")

            page << set_element_visible("user_proxies_div",        @edit[:new][:authentication][:ldap_role])
            page << set_element_visible("ldap_role_details_div",   @edit[:new][:authentication][:ldap_role])
            page << set_element_visible("ldap_default_group_div", !@edit[:new][:authentication][:ldap_role])

            page << (@edit[:new][:authentication][:ldap_role] ? javascript_checked('ldap_role') : javascript_unchecked('ldap_role'))
          else
            page << javascript_hide("ldap_div")
            page << javascript_hide("ldap_role_div")
            page << javascript_hide("user_proxies_div")
          end
          verb = @edit[:new][:authentication][:mode] == 'amazon'
          page << set_element_visible("amazon_div", verb)
          page << set_element_visible("amazon_role_div", verb)

          verb = @edit[:new][:authentication][:mode] == 'httpd'
          page << set_element_visible("httpd_div", verb)
          page << set_element_visible("httpd_role_div", verb)
        end
        if @provider_type_changed
          verb = @edit[:new][:authentication][:provider_type] == 'none'
          page << set_element_visible("none_local_login_div", !verb)
        end
        if @authusertype_changed
          verb = @edit[:new][:authentication][:user_type] == 'samaccountname'
          page << set_element_visible("user_type_samaccountname", verb)
          page << set_element_visible("user_type_base", !verb)
          if @edit[:new][:authentication][:user_type] == "dn-cn"
            page << javascript_hide("upn-mail_prefix")
            page << javascript_hide("dn-uid_prefix")
            page << javascript_show("dn-cn_prefix")
          elsif @edit[:new][:authentication][:user_type] == "dn-uid"
            page << javascript_hide("upn-mail_prefix")
            page << javascript_hide("dn-cn_prefix")
            page << javascript_show("dn-uid_prefix")
          else
            page << javascript_hide("dn-cn_prefix")
            page << javascript_hide("dn-uid_prefix")
            page << javascript_show("upn-mail_prefix")
          end
        end
        if @authldaprole_changed
          page << set_element_visible("user_proxies_div", @edit[:new][:authentication][:ldap_role])
          page << set_element_visible("ldap_role_details_div", @edit[:new][:authentication][:ldap_role])
          page << set_element_visible("ldap_default_group_div", !@edit[:new][:authentication][:ldap_role])
        end
        if @authldapport_reset
          page << "$('#authentication_ldapport').val('#{@edit[:new][:authentication][:ldapport]}');"
        end
        if @reset_verify_button
          if !@edit[:new][:authentication][:ldaphost].empty? && !@edit[:new][:authentication][:ldapport].nil?
            page << javascript_hide("verify_button_off")
            page << javascript_show("verify_button_on")
          else
            page << javascript_hide("verify_button_on")
            page << javascript_show("verify_button_off")
          end
        end
        if @reset_amazon_verify_button
          if !@edit[:new][:authentication][:amazon_key].nil? && !@edit[:new][:authentication][:amazon_secret].nil?
            page << javascript_hide("amazon_verify_button_off")
            page << javascript_show("amazon_verify_button_on")
          else
            page << javascript_hide("amazon_verify_button_on")
            page << javascript_show("amazon_verify_button_off")
          end
        end
      end

      page << javascript_for_miq_button_visibility(@changed || @login_text_changed)
    end
  end

  def settings_update
    assert_privileges("ops_settings")

    case params[:button]
    when 'verify'        then settings_update_ldap_verify
    when 'amazon_verify' then settings_update_amazon_verify
    when 'email_verify'  then settings_update_email_verify
    when 'save'          then settings_update_save
    when 'reset'         then settings_update_reset
    end
  end

  def smartproxy_affinity_field_changed
    assert_privileges("zone_admin")

    settings_load_edit
    return unless @edit

    smartproxy_affinity_get_form_vars(params[:id], params[:check] == '1') if params[:id] && params[:check]

    javascript_miq_button_visibility(@edit[:new] != @edit[:current])
  end

  def pglogical_subscriptions_form_fields
    assert_privileges("ops_settings")

    replication_type = MiqRegion.replication_type
    subscriptions = replication_type == :global ? PglogicalSubscription.all : []
    subscriptions = get_subscriptions_array(subscriptions) unless subscriptions.empty?

    render :json => {
      :replication_type => replication_type,
      :subscriptions    => subscriptions
    }
  end

  def pglogical_save_subscriptions
    assert_privileges("ops_settings")

    case params[:replication_type]
    when "global"
      subscriptions_to_save, subsciptions_to_remove = prepare_subscriptions_for_saving
      task_opts = {:action => "Save subscriptions for global region", :userid => session[:userid]}
      queue_opts = {:class_name => "MiqPglogical", :method_name => "save_global_region",
                    :args       => [subscriptions_to_save, subsciptions_to_remove]}
      ActiveRecord.yaml_column_permitted_classes = YamlPermittedClasses.app_yaml_permitted_classes | [subscriptions_to_save.first.class, subsciptions_to_remove.first.class]
    when "remote"
      task_opts  = {:action => "Configure the database to be a replication remote region",
                    :userid => session[:userid]}
      queue_opts = {:class_name => "MiqRegion", :method_name => "replication_type=", :args => [:remote]}
    when "none"
      task_opts  = {:action => "Set replication type to none", :userid => session[:userid]}
      queue_opts = {:class_name => "MiqRegion", :method_name => "replication_type=", :args => [:none]}
    end
    MiqTask.generic_action_with_callback(task_opts, queue_opts)
    add_flash(_("Replication configuration save initiated. Check status of task \"%{task_name}\" on My Tasks screen") %
                {:task_name => task_opts[:name]})
    javascript_flash
  end

  def pglogical_validate_subscription
    assert_privileges("ops_settings")

    subscription = find_or_new_subscription(params[:id])
    valid = subscription.validate(params_for_connection_validation(params))
    if valid.nil?
      add_flash(_("Subscription Credentials validated successfully"))
    else
      valid.each do |v|
        add_flash(v, :error)
      end
    end
    javascript_flash
  end

  private

  def update_server_name(server)
    return unless @sb[:active_tab] == 'settings_server'
    return if @edit[:new][:server][:name] == server.name # appliance name was modified

    begin
      server.name = @edit[:new][:server][:name]
      server.save!
    rescue => bang
      add_flash(_("Error when saving new server name: %{message}") % {:message => bang.message}, :error)
      javascript_flash
      nil
    end
  end

  PASSWORD_MASK = '●●●●●●●●'.freeze

  def prepare_subscriptions_for_saving
    to_save = []
    to_remove = []
    params[:subscriptions]&.each do |_k, subscription_params|
      subscription = find_or_new_subscription(subscription_params['id'])
      if subscription.id && subscription_params['remove'] == "true"
        to_remove << subscription
      else
        set_subscription_attributes(subscription, subscription_params)
        to_save << subscription
      end
    end
    return to_save, to_remove
  end

  def fetch_advanced_settings(resource)
    @edit = {}
    @edit[:current] = {:file_data => resource.settings_for_resource_yaml}
    @edit[:new] = copy_hash(@edit[:current])
    @edit[:key] = "#{@sb[:active_tab]}_edit__#{@sb[:selected_server_id]}"
    @in_a_form = true
  end

  def save_advanced_settings(resource)
    resource.add_settings_for_resource_yaml(@edit[:new][:file_data])
  rescue Vmdb::Settings::ConfigurationInvalid => err
    err.errors.each do |error|
      add_flash("#{error.attribute.to_s.titleize}: #{error.message}", :error)
    end
    @changed = (@edit[:new] != @edit[:current])
    javascript_flash
  else
    add_flash(_("Configuration changes saved"))
    @changed = false
    get_node_info(x_node)
    replace_right_cell(:nodetype => @nodetype)
  end

  def find_or_new_subscription(id = nil)
    id.nil? ? PglogicalSubscription.new : PglogicalSubscription.find(id)
  end

  def set_subscription_attributes(subscription, params)
    params['password'] = ManageIQ::Password.encrypt(params['password'])
    params_for_connection_validation(params).each do |k, v|
      subscription.send("#{k}=".to_sym, v)
    end
  end

  def params_for_connection_validation(subscription_params)
    {'host'     => subscription_params['host'],
     'port'     => subscription_params['port'],
     'user'     => subscription_params['user'],
     'dbname'   => subscription_params['dbname'],
     'password' => subscription_params['password'] == PASSWORD_MASK ? nil : subscription_params['password']}.delete_blanks
  end

  def get_subscriptions_array(subscriptions)
    subscriptions.collect do |sub|
      {
        :dbname          => sub.dbname,
        :host            => sub.host,
        :id              => sub.id,
        :user            => sub.user,
        :password        => '●●●●●●●●',
        :port            => sub.port,
        :provider_region => sub.provider_region,
        :backlog         => number_to_human_size(sub.backlog),
        :status          => sub.status
      }
    end
  end

  def settings_update_ldap_verify
    settings_get_form_vars
    return unless @edit

    server_config = MiqServer.find(@sb[:selected_server_id]).settings
    server_config.each_key do |category|
      server_config[category] = @edit[:new][category].dup
    end

    valid, errors = MiqLdap.validate_connection(server_config)
    if valid
      add_flash(_("LDAP Settings validation was successful"))
    else
      errors.each do |error|
        add_flash("#{error.attribute.to_s.titleize}: #{error.message}", :error)
      end
    end

    javascript_flash
  end

  def settings_update_amazon_verify
    settings_get_form_vars
    return unless @edit

    server_config = MiqServer.find(@sb[:selected_server_id]).settings
    server_config.each_key do |category|
      server_config[category] = @edit[:new][category].dup
    end

    valid, errors = Authenticator::Amazon.validate_connection(server_config)
    if valid
      add_flash(_("Amazon Settings validation was successful"))
    else
      errors.each do |error|
        add_flash("#{error.attribute.to_s.titleize}: #{error.message}", :error)
      end
    end
    javascript_flash
  end

  def settings_update_email_verify
    settings_get_form_vars
    return unless @edit

    begin
      GenericMailer.test_email(@sb[:new_to], @edit[:new][:smtp]).deliver
    rescue Exception => err
      add_flash(_("Error during sending test email: %{class_name}, %{error_message}") %
        {:class_name => err.class.name, :error_message => err.to_s}, :error)
    else
      add_flash(_("The test email is being delivered, check \"%{email}\" to verify it was successful") %
                  {:email => @sb[:new_to]})
    end
    javascript_flash
  end

  def update_server_zone(server)
    zone = Zone.find_by(:name => @edit[:new][:server][:zone])
    return true if zone.nil? || server.zone == zone

    server.zone = zone
    server.save
  end

  def settings_update_save
    settings_get_form_vars
    return unless @edit

    case @sb[:active_tab]
    when "settings_smartproxy_affinity"
      smartproxy_affinity_update
    when "settings_server", "settings_authentication"
      # Server Settings
      settings_server_validate
      if @flash_array.present?
        render_flash
        return
      end
      @edit[:new][:authentication][:ldaphost]&.reject!(&:blank?)
      @changed = (@edit[:new] != @edit[:current])
      server = MiqServer.find(@sb[:selected_server_id])
      unless update_server_zone(server)
        server.errors.full_messages.each { |message| add_flash(message, :error) }
        render_flash
        return
      end
      @update = server.settings
    when "settings_custom_logos" # Custom Logo tab
      @changed = (@edit[:new] != @edit[:current])
      @update = ::Settings.to_hash
    when "settings_advanced" # Advanced manual yaml editor tab
      nodes = x_node.downcase.split("-")
      resource = if selected?(x_node, "z")
                   Zone.find(nodes.last)
                 elsif selected?(x_node, "svr")
                   MiqServer.find(@sb[:selected_server_id])
                 else
                   MiqRegion.my_region
                 end
      save_advanced_settings(resource)
      return
    end
    if !%w[settings_advanced].include?(@sb[:active_tab]) &&
       x_node.split("-").first != "z"
      @update.each_key do |category|
        @update[category] = @edit[:new][category].dup
      end


      config_valid, config_errors = Vmdb::Settings.validate(@update)
      if config_valid
        if %w[settings_server settings_authentication].include?(@sb[:active_tab])
          server = MiqServer.find(@sb[:selected_server_id])
          server.add_settings_for_resource(@update)
          update_server_name(server)
        else
          MiqServer.my_server.add_settings_for_resource(@update)
        end
        AuditEvent.success(build_config_audit(@edit))
        if @sb[:active_tab] == "settings_server"
          add_flash(_("Configuration settings saved for %{product} Server \"%{name} [%{server_id}]\" in Zone \"%{zone}\"") %
                      {:name => server.name, :server_id => server.id, :zone => server.my_zone, :product => Vmdb::Appliance.PRODUCT_NAME})
        elsif @sb[:active_tab] == "settings_authentication"
          add_flash(_("Authentication settings saved for %{product} Server \"%{name} [%{server_id}]\" in Zone \"%{zone}\"") %
                      {:name => server.name, :server_id => server.id, :zone => server.my_zone, :product => Vmdb::Appliance.PRODUCT_NAME})
        else
          add_flash(_("Configuration settings saved"))
        end
        if @sb[:active_tab] == "settings_server" && @sb[:selected_server_id] == MiqServer.my_server.id # Reset session variables for names fields, if editing current server config
          session[:vmdb_name] = @update[:server][:name]
        end
        set_user_time_zone if @sb[:active_tab] == "settings_server"
        # settings_set_form_vars
        session[:changed] = @changed = false
        get_node_info(x_node)
        if @sb[:active_tab] == "settings_server"
          replace_right_cell(:nodetype => @nodetype, :replace_trees => %i[diagnostics settings])
        elsif @sb[:active_tab] == "settings_custom_logos"
          flash_to_session
          javascript_redirect(:action => 'explorer', :escape => false) # redirect to build the server screen
          nil
        else
          replace_right_cell(:nodetype => @nodetype)
        end
      else
        config_errors.each do |field, msg|
          add_flash("#{field.titleize}: #{msg}", :error)
        end
        @changed = true
        session[:changed] = @changed
        get_node_info(x_node)
        replace_right_cell(:nodetype => @nodetype)
      end
    else
      @changed = false
      get_node_info(x_node)
      replace_right_cell(:nodetype => @nodetype)
    end
  end

  def settings_update_reset
    session[:changed] = @changed = false
    add_flash(_("All changes have been reset"), :warning)
    get_node_info(x_node)
    replace_right_cell(:nodetype => @nodetype)
  end

  def settings_server_validate
    return unless @sb[:active_tab] == "settings_server" && @edit[:new][:server]

    if @edit[:new][:server][:name].blank?
      add_flash(_("Appliance name must be entered."), :error)
    end
    if @edit[:new][:server][:custom_support_url].present? && @edit[:new][:server][:custom_support_url_description].blank? ||
       @edit[:new][:server][:custom_support_url].blank? && @edit[:new][:server][:custom_support_url_description].present?
      add_flash(_("Custom Support URL and Description both must be entered."), :error)
    end
  end

  def smartproxy_affinity_get_form_vars(id, checked)
    # Add/remove affinity based on the node that was checked
    server_id, child = id.split('__')

    if server_id.include?('svr')
      server_id = server_id.sub('svr-', '')
    else
      server_id.sub!('xx-', '')
    end
    all_children = @edit[:new][:children]
    server = @edit[:new][:servers][server_id.to_i]

    if child
      # A host/storage node was selected
      child_type, child_id = child.split('_')
      child_key = child_type.pluralize.to_sym

      children_update = child_id.blank? ? all_children[child_key] : [child_id.to_i]
      if checked
        server[child_key] += children_update
      else
        server[child_key] -= children_update
      end
    elsif checked # a server was selected
      all_children.each { |k, v| server[k] = Set.new(v) }
    else
      server.each_value(&:clear)
    end
  end

  def smartproxy_affinity_set_form_vars
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "#{@sb[:active_tab]}_edit__#{@selected_zone.id}"
    @sb[:selected_zone_id] = @selected_zone.id

    children = @edit[:current][:children] = {}
    children[:hosts] = @selected_zone.hosts.collect(&:id)
    children[:storages] = @selected_zone.storages.collect(&:id)
    servers = @edit[:current][:servers] = {}
    @selected_zone.miq_servers.each do |server|
      next unless server.is_a_proxy?

      servers[server.id] = {
        :hosts    => Set.new(server.vm_scan_host_affinity.collect(&:id)),
        :storages => Set.new(server.vm_scan_storage_affinity.collect(&:id))
      }
    end

    if @selected_zone.miq_servers.select(&:is_a_proxy?).present?
      @smartproxy_affinity_tree = TreeBuilderSmartproxyAffinity.new(:smartproxy_affinity_tree,
                                                                    @sb,
                                                                    true,
                                                                    :data => @selected_zone)
    end
    @edit[:new] = copy_hash(@edit[:current])
    session[:edit] = @edit
    @in_a_form = true
  end

  def smartproxy_affinity_update
    @changed = (@edit[:new] != @edit[:current])
    MiqServer.transaction do
      @edit[:new][:servers].each do |svr_id, children|
        server = MiqServer.find(svr_id)
        server.vm_scan_host_affinity = Host.where(:id => children[:hosts].to_a).to_a
        server.vm_scan_storage_affinity = Storage.where(:id => children[:storages].to_a).to_a
      end
    end
  rescue => bang
    add_flash(_("Error during Analysis Affinity save: %{message}") % {:message => bang.message}, :error)
  else
    add_flash(_("Analysis Affinity was saved"))
  end

  # load @edit from session and then update @edit from params based on active_tab
  def settings_get_form_vars
    settings_load_edit
    return unless @edit

    @in_a_form = true
    nodes = x_node.downcase.split("-")
    cls = nodes.first.split('__').last == "z" ? Zone : MiqServer

    params = self.params
    new = @edit[:new]

    # WTF? here we can have a Zone or a MiqServer, what about Region? --> rescue from exception
    @selected_server = (cls.find(nodes.last) rescue nil)

    case @sb[:active_tab] # No @edit[:current] for Filters since there is no config file
    when "settings_server"                                                # Server Settings tab
      if !params[:smtp_test_to].nil? && params[:smtp_test_to] != ""
        @sb[:new_to] = params[:smtp_test_to]
      elsif params[:smtp_test_to] && (params[:smtp_test_to] == "" || params[:smtp_test_to].nil?)
        @sb[:new_to] = nil
      end
      new[:smtp][:authentication] = params[:smtp_authentication] if params[:smtp_authentication]
      new[:server][:locale] = params[:locale] if params[:locale]
      @smtp_auth_none = (new[:smtp][:authentication] == "none")
      @test_email_button = %i[from host port domain].all? { |item| new[:smtp][item].present? } &&
                           (new[:smtp][:user_name].present? || new[:smtp][:authentication] == "none") && @sb[:new_to].present?
      @sb[:roles] = new[:server][:role].split(",")
      params.each do |var, val|
        if var.to_s.starts_with?("server_roles_") && val.to_s == "true"
          @sb[:roles].push(var.split("server_roles_").last) unless @sb[:roles].include?(var.split("server_roles_").last)
        elsif var.to_s.starts_with?("server_roles_") && val.downcase == "false"
          @sb[:roles].delete(var.split("server_roles_").last)
        end
        server_role = @sb[:roles].sort.join(",")
        new[:server][:role] = server_role
        session[:selected_roles] = new[:server][:role].split(",") if !new[:server].nil? && !new[:server][:role].nil?
      end
      @host_choices = session[:host_choices]

      new[:server][:custom_support_url] = params[:custom_support_url].strip if params[:custom_support_url]
      new[:server][:custom_support_url_description] = params[:custom_support_url_description] if params[:custom_support_url_description]
      new[:server][:name] = params[:server_name] if params[:server_name]
    when "settings_authentication"                                        # Authentication tab
      auth = new[:authentication]
      @sb[:form_vars][:session_timeout_mins] = params[:session_timeout_mins] if params[:session_timeout_mins]
      @sb[:form_vars][:session_timeout_hours] = params[:session_timeout_hours] if params[:session_timeout_hours]
      new[:session][:timeout] = @sb[:form_vars][:session_timeout_hours].to_i * 3600 + @sb[:form_vars][:session_timeout_mins].to_i * 60 if params[:session_timeout_hours] || params[:session_timeout_mins]
      @sb[:newrole] = (params[:ldap_role].to_s == "1") if params[:ldap_role]
      @sb[:new_amazon_role] = (params[:amazon_role].to_s == "1") if params[:amazon_role]
      @sb[:new_httpd_role] = (params[:httpd_role].to_s == "1") if params[:httpd_role]
      if params[:provider_type] && params[:provider_type] != auth[:provider_type]
        auth[:provider_type] = params[:provider_type]
        auth[:saml_enabled] = params[:provider_type] == "saml"
        auth[:oidc_enabled] = params[:provider_type] == "oidc"
        @provider_type_changed = true
      end
      if params[:authentication_user_type] && params[:authentication_user_type] != auth[:user_type]
        @authusertype_changed = true
      end
      auth[:user_suffix] = params[:authentication_user_suffix] if params[:authentication_user_suffix]
      auth[:domain_prefix] = params[:authentication_domain_prefix] if params[:authentication_domain_prefix]
      if @sb[:newrole] != auth[:ldap_role]
        auth[:ldap_role] = @sb[:newrole]
        @authldaprole_changed = true
      end
      if @sb[:new_amazon_role] != auth[:amazon_role]
        auth[:amazon_role] = @sb[:new_amazon_role]
      end
      if @sb[:new_httpd_role] != auth[:httpd_role]
        auth[:httpd_role] = @sb[:new_httpd_role]
      end
      if params[:authentication_mode] && params[:authentication_mode] != auth[:mode]
        if params[:authentication_mode] == "ldap"
          params[:authentication_ldapport] = "389"
          @sb[:newrole] = auth[:ldap_role] = @edit[:current][:authentication][:ldap_role]
          @authldapport_reset = true
        elsif params[:authentication_mode] == "ldaps"
          params[:authentication_ldapport] = "636"
          @sb[:newrole] = auth[:ldap_role] = @edit[:current][:authentication][:ldap_role]
          @authldapport_reset = true
        else
          @sb[:newrole] = auth[:ldap_role] = false # setting it to false if database was selected to hide user_proxies box
        end
        @authmode_changed = true
      end
      if (params[:authentication_ldaphost_1] || params[:authentication_ldaphost_2] || params[:authentication_ldaphost_3]) ||
         (params[:authentication_ldapport] != auth[:ldapport])
        @reset_verify_button = true
      end
      if (params[:authentication_amazon_key] != auth[:amazon_key]) ||
         (params[:authentication_amazon_secret] != auth[:amazon_secret])
        @reset_amazon_verify_button = true
      end

      auth[:amazon_key] = params[:authentication_amazon_key] if params[:authentication_amazon_key]
      auth[:amazon_secret] = params[:authentication_amazon_secret] if params[:authentication_amazon_secret]
      auth[:ldaphost] ||= []
      auth[:ldaphost][0] = params[:authentication_ldaphost_1] if params[:authentication_ldaphost_1]
      auth[:ldaphost][1] = params[:authentication_ldaphost_2] if params[:authentication_ldaphost_2]
      auth[:ldaphost][2] = params[:authentication_ldaphost_3] if params[:authentication_ldaphost_3]

      auth[:follow_referrals] = (params[:follow_referrals].to_s == "1") if params[:follow_referrals]
      auth[:get_direct_groups] = (params[:get_direct_groups].to_s == "1") if params[:get_direct_groups]
      if params[:user_proxies] && params[:user_proxies][:mode] != auth[:user_proxies][0][:mode]
        if params[:user_proxies][:mode] == "ldap"
          params[:user_proxies][:ldapport] = "389"
          @user_proxies_port_reset = true
        elsif params[:user_proxies][:mode] == "ldaps"
          params[:user_proxies][:ldapport] = "636"
          @user_proxies_port_reset = true
        end
        @authmode_changed = true
      end
      auth[:sso_enabled] = (params[:sso_enabled].to_s == "1") if params[:sso_enabled]
      auth[:provider_type] = params[:provider_type] if params[:provider_type]
      auth[:local_login_disabled] = (params[:local_login_disabled].to_s == "1") if params[:local_login_disabled]
      auth[:default_group_for_users] = params[:authentication_default_group_for_users] if params[:authentication_default_group_for_users]

    when "settings_custom_logos" # Custom Logo tab
      new[:server][:custom_logo] = (params[:server_uselogo] == "true") if params[:server_uselogo]
      new[:server][:custom_login_logo] = (params[:server_useloginlogo] == "true") if params[:server_useloginlogo]
      new[:server][:custom_favicon] = (params[:server_usefavicon] == "true") if params[:server_usefavicon]
      new[:server][:custom_brand] = (params[:server_usebrand] == "true") if params[:server_usebrand]
      new[:server][:use_custom_login_text] = (params[:server_uselogintext] == "true") if params[:server_uselogintext]
      if params[:login_text]
        new[:server][:custom_login_text] = params[:login_text]
        @login_text_changed = new[:server][:custom_login_text] != @edit[:current][:server][:custom_login_text].to_s
      end
    when "settings_smartproxy" # SmartProxy Defaults tab
      @sb[:form_vars][:agent_heartbeat_frequency_mins] = params[:agent_heartbeat_frequency_mins] if params[:agent_heartbeat_frequency_mins]
      @sb[:form_vars][:agent_heartbeat_frequency_secs] = params[:agent_heartbeat_frequency_secs] if params[:agent_heartbeat_frequency_secs]
      @sb[:form_vars][:agent_log_wraptime_days] = params[:agent_log_wraptime_days] if params[:agent_log_wraptime_days]
      @sb[:form_vars][:agent_log_wraptime_hours] = params[:agent_log_wraptime_hours] if params[:agent_log_wraptime_hours]
      agent = new[:agent]
      agent_log = agent[:log]
      agent[:heartbeat_frequency] = @sb[:form_vars][:agent_heartbeat_frequency_mins].to_i * 60 + @sb[:form_vars][:agent_heartbeat_frequency_secs].to_i if params[:agent_heartbeat_frequency_mins] || params[:agent_heartbeat_frequency_secs]
      agent[:readonly] = (params[:agent_readonly] == "1") if params[:agent_readonly]
      agent_log[:level] = params[:agent_log_level] if params[:agent_log_level]
      agent_log[:wrap_size] = params[:agent_log_wrapsize] if params[:agent_log_wrapsize]
      agent_log[:wrap_time] = @sb[:form_vars][:agent_log_wraptime_days].to_i * 3600 * 24 + @sb[:form_vars][:agent_log_wraptime_hours].to_i * 3600 if params[:agent_log_wraptime_days] || params[:agent_log_wraptime_hours]
    when "settings_advanced"                          # Advanced tab
      if params[:file_data]                           # If save sent in the file data
        new[:file_data] = params[:file_data]          # Put into @edit[:new] hash
      else
        new[:file_data] += "..."                      # Update the new data to simulate a change
      end
    end

    # This section scoops up the config second level keys changed in the UI
    unless %w[settings_advanced settings_smartproxy_affinity].include?(@sb[:active_tab])
      @edit[:current].each_key do |category|
        @edit[:current][category].symbolize_keys.each_key do |key|
          if category == :smtp && key == :enable_starttls_auto # Checkbox is handled differently
            new[category][key] = params["#{category}_#{key}"] == "true" if params.key?("#{category}_#{key}")
          elsif params["#{category}_#{key}"]
            new[category][key] = params["#{category}_#{key}"]
          end
        end
        auth[:user_proxies][0] = copy_hash(params[:user_proxies]) if params[:user_proxies] && category == :authentication
      end
    end
  end

  # Load the @edit object from session based on which config screen we are on
  def settings_load_edit
    if selected?(x_node, "z") && @sb[:active_tab] != "settings_advanced"
      # if zone node is selected
      return unless load_edit("#{@sb[:active_tab]}_edit__#{@sb[:selected_zone_id]}", "replace_cell__explorer")

      @prev_selected_svr = session[:edit][:new][:selected_server]
    elsif %w[settings_server settings_authentication
             settings_custom_logos settings_advanced].include?(@sb[:active_tab])
      return unless load_edit("settings_#{params[:id]}_edit__#{@sb[:selected_server_id]}", "replace_cell__explorer")
    end
  end

  def settings_set_form_vars_server
    @edit = {
      :new     => {},
      :current => MiqServer.find(@sb[:selected_server_id]).settings,
      :key     => "#{@sb[:active_tab]}_edit__#{@sb[:selected_server_id]}",
    }
    @sb[:new_to] = nil
    @sb[:newrole] = false

    @edit[:current][:server][:role] = @edit[:current][:server][:role] ? @edit[:current][:server][:role].split(",").sort.join(",") : ""
    @edit[:current][:server][:timezone] = "UTC" if @edit[:current][:server][:timezone].blank?
    @edit[:current][:server][:locale] = "default" if @edit[:current][:server][:locale].blank?
    @edit[:current][:smtp][:enable_starttls_auto] = GenericMailer.default_for_enable_starttls_auto if @edit[:current][:smtp][:enable_starttls_auto].nil?
    @edit[:current][:smtp][:openssl_verify_mode] ||= "none"
    @edit[:current][:server][:zone] = MiqServer.find(@sb[:selected_server_id]).zone.name
    @edit[:current][:server][:name] = MiqServer.find(@sb[:selected_server_id]).name

    @in_a_form = true
  end

  def settings_set_form_vars_authentication
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "#{@sb[:active_tab]}_edit__#{@sb[:selected_server_id]}"
    @edit[:current] = MiqServer.find(@sb[:selected_server_id]).settings
    # Avoid thinking roles change when not yet set
    @edit[:current][:authentication][:ldap_role] ||= false
    @edit[:current][:authentication][:amazon_role] ||= false
    @edit[:current][:authentication][:httpd_role] ||= false
    @sb[:form_vars] = {}
    @sb[:form_vars][:session_timeout_hours] = @edit[:current][:session][:timeout] / 3600
    @sb[:form_vars][:session_timeout_mins] = (@edit[:current][:session][:timeout] % 3600) / 60
    @edit[:current][:authentication][:ldaphost] = Array.wrap(@edit[:current][:authentication][:ldaphost])
    @edit[:current][:authentication][:user_proxies] ||= [{}]
    @edit[:current][:authentication][:follow_referrals] ||= false
    @edit[:current][:authentication][:sso_enabled] ||= false
    @edit[:current][:authentication][:provider_type] ||= "none"
    @edit[:current][:authentication][:local_login_disabled] ||= false
    @sb[:newrole] = @edit[:current][:authentication][:ldap_role]
    @sb[:new_amazon_role] = @edit[:current][:authentication][:amazon_role]
    @sb[:new_httpd_role] = @edit[:current][:authentication][:httpd_role]
    @in_a_form = true
  end

  def settings_set_form_vars_logos
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = ::Settings.to_hash
    @edit[:key] = "#{@sb[:active_tab]}_edit__#{@sb[:selected_server_id]}"
    if @edit[:current][:server][:custom_logo].nil?
      @edit[:current][:server][:custom_logo] = false # Set default custom_logo flag
    end
    if @edit[:current][:server][:custom_login_logo].nil?
      @edit[:current][:server][:custom_login_logo] = false # Set default custom_logo flag
    end
    if @edit[:current][:server][:custom_brand].nil?
      @edit[:current][:server][:custom_brand] = false # Set default custom_brand flag
    end
    if @edit[:current][:server][:custom_favicon].nil?
      @edit[:current][:server][:custom_favicon] = false # Set default custom_favicon flag
    end

    if @edit[:current][:server][:use_custom_login_text].nil?
      @edit[:current][:server][:use_custom_login_text] = false # Set default custom_login_text flag
    end
    @logo_file = @@logo_file
    @login_logo_file = @@login_logo_file
    @login_brand_file = @@login_brand_file
    @favicon_file = @@favicon_file
    @in_a_form = true
  end

  def settings_set_form_vars
    @right_cell_text = if x_node.split("-").first == "z"
                         if my_zone_name == @selected_zone.name
                           _("Settings %{model} \"%{name}\" (current)") % {:name  => @selected_zone.description,
                                                                           :model => ui_lookup(:model => @selected_zone.class.to_s)}
                         else
                           _("Settings %{model} \"%{name}\"") % {:name  => @selected_zone.description,
                                                                 :model => ui_lookup(:model => @selected_zone.class.to_s)}
                         end
                       elsif my_server.id == @sb[:selected_server_id]
                         _("Settings %{model} \"%{name}\" (current)") % {:name  => "#{@selected_server.name} [#{@selected_server.id}]",
                                                                         :model => ui_lookup(:model => @selected_server.class.to_s)}
                       else
                         _("Settings %{model} \"%{name}\"") % {:name  => "#{@selected_server.name} [#{@selected_server.id}]",
                                                               :model => ui_lookup(:model => @selected_server.class.to_s)}
                       end
    case @sb[:active_tab]
    when 'settings_server' # Server Settings tab
      settings_set_form_vars_server
    when 'settings_authentication' # Authentication tab
      settings_set_form_vars_authentication
    when 'settings_smartproxy_affinity' # SmartProxy Affinity tab
      smartproxy_affinity_set_form_vars
    when 'settings_custom_logos' # Custom Logo tab
      settings_set_form_vars_logos
    when "settings_advanced" # Advanced yaml editor
      fetch_advanced_settings(MiqServer.find(@sb[:selected_server_id]))
    end
    if %w[settings_server settings_authentication settings_custom_logos].include?(@sb[:active_tab]) &&
       x_node.split("-").first != "z"
      @edit[:new] = @edit[:current].deep_clone
      if @sb[:active_tab] == "settings_server"
        session[:selected_roles] = @edit[:new][:server][:role].split(",") if !@edit[:new][:server].nil? && !@edit[:new][:server][:role].nil?
        server_roles = MiqServer.licensed_roles # Get the roles this server is licensed for
        server_roles.delete_if { |r| r.name == "database_owner" }
        session[:server_roles] = {}
        server_roles.each do |sr|
          session[:server_roles][sr["name"]] = sr["description"] unless session[:server_roles].key?(sr["name"])
        end
      end
    end
    session[:edit] = @edit
  end

  # Get information for a settings node
  def settings_get_info(nodetype = x_node)
    nodes = nodetype.downcase.split("-")
    case nodes[0]
    when "root"
      @settings_tab, @settings_tab_length = settings_tab_index_by_name(@sb[:active_tab])
      @subtab = settings_tags_tab_index_by_name(@sb[:active_subtab])
      @right_cell_text = _("%{product} Region \"%{name}\"") %
                         {:name    => "#{MiqRegion.my_region.description} [#{MiqRegion.my_region.region}]",
                          :product => Vmdb::Appliance.PRODUCT_NAME}
      case @sb[:active_tab]
      when "settings_details"
        settings_set_view_vars
      when "settings_cu_collection" # C&U collection settings
        cu_build_edit_screen
        @in_a_form = true
      when "settings_tags"
        case @sb[:active_subtab]
        when "settings_my_company_categories"
          category_get_all
        when "settings_my_company_tags"
          # dont hide the disabled categories, so user can remove tags from the disabled ones
          cats = Classification.categories.sort_by(&:description)  # Get the categories, sort by name
          @cats = {}                                               # Classifications array for first chooser
          cats.each do |c|
            @cats[c.description] = c.name unless c.read_only?      # Show the non-read_only categories
          end
          @cat = cats.first
          ce_build_screen                                          # Build the Classification Edit screen
        when "settings_import_tags"
          @edit = {}
          @edit[:new] = {}
          @edit[:key] = "#{@sb[:active_tab]}_edit__#{@sb[:selected_server_id]}"
          add_flash(_("Locate and upload a file to start the import process"), :info)
          @in_a_form = true
        when "settings_import_variables" # Import tab
          @edit = {}
          @edit[:new] = {}
          @edit[:key] = "#{@sb[:active_tab]}_edit__#{@sb[:selected_server_id]}"
          @edit[:new][:upload_type] = nil
          @sb[:good] = nil unless @sb[:show_button]
          add_flash(_("Choose the type of custom variables to be imported"), :info)
          @in_a_form = true
        when "settings_map_tags"
          label_tag_mapping_get_all
        end
      when "settings_help_menu"
        @in_a_form = true
        @edit = {:new => {}, :key => 'customize_help_menu'}
        @edit[:new] = Settings.help_menu.to_h
        Menu::DefaultMenu.help_menu_items.each do |item|
          id = item.id.to_sym
          @edit[:new][id] = Settings.help_menu.try(id).try(:to_h) || {}
        end
        @edit[:current] = copy_hash(@edit[:new])
        session[:edit] = @edit
        session[:changed] = false
      when "settings_advanced"
        fetch_advanced_settings(MiqRegion.my_region)
      end
    when "xx"
      case nodes[1]
      when "z"
        @right_cell_text = _("Settings Zones")
        @zones = Zone.visible.in_my_region
      when "sis"
        @right_cell_text = _("Settings Analysis Profiles")
        aps_list
      when "msc"
        @right_cell_text = _("Settings Schedules")
        schedules_list
      end
    when "svr"
      # @sb[:tabform] = "operations_1" if @sb[:selected_server] && @sb[:selected_server].id != nodetype.downcase.split("-").last.to_i #reset tab if server node was changed, current server has 10 tabs, current active tab may not be available for other server nodes.
      #     @sb[:selected_server] = MiqServer.find(nodetype.downcase.split("-").last)
      @selected_server = MiqServer.find(nodes.last)
      @sb[:selected_server_id] = @selected_server.id
      settings_set_form_vars
    when "msc"
      @record = @selected_schedule = MiqSchedule.find(nodes.last)
      @right_cell_text = _("Settings Schedule \"%{name}\"") % {:name => @selected_schedule.name}
      schedule_show
    when "sis"
      @record = @selected_scan = ScanItemSet.find(nodes.last)
      @right_cell_text = _("Settings Analysis Profile \"%{name}\"") % {:name => @selected_scan.name}
      ap_show
    when "z"
      @servers = []
      @record = @zone = @selected_zone = Zone.find(nodes.last)
      @right_cell_text = if my_zone_name == @selected_zone.name
                           _("Settings %{model} \"%{name}\" (current)") % {:name  => @selected_zone.description,
                                                                           :model => ui_lookup(:model => @selected_zone.class.to_s)}
                         else
                           _("Settings %{model} \"%{name}\"") % {:name  => @selected_zone.description,
                                                                 :model => ui_lookup(:model => @selected_zone.class.to_s)}
                         end
      MiqServer.all.each do |ms|
        if ms.zone_id == @selected_zone.id
          @servers.push(ms)
        end
      end
      smartproxy_affinity_set_form_vars if @sb[:active_tab] == "settings_smartproxy_affinity"
      fetch_advanced_settings(@record) if @sb[:active_tab] == "settings_advanced"
    end
  end

  def settings_set_view_vars
    if @sb[:active_tab] == "settings_details"
      # Enterprise Details tab
      @scan_items = ScanItemSet.all
      @zones = Zone.visible.in_my_region
      @miq_schedules = MiqSchedule.where("(prod_default != 'system' or prod_default is null) and adhoc IS NULL")
                                  .sort_by { |s| s.name.downcase }
    end
  end
end
