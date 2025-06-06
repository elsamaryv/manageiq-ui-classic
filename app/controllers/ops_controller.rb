class OpsController < ApplicationController
  # Methods for accordions
  include Diagnostics
  include OpsRbac
  include Settings
  include OpsHelper::MyServer
  include Mixins::CustomButtonDialogFormMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericShowMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action

  def self.table_name
    @table_name ||= 'ops'
  end

  def self.model
    Tenant
  end

  def index
    redirect_to(:action => 'explorer')
  end

  def self.display_methods
    %w[service_templates providers ae_namespaces]
  end

  def display_service_templates
    nested_list(
      ServiceTemplate,
      :breadcrumb_title => _('Catalog Items and Bundles'),
      :association      => :nested_service_templates,
      :parent           => @record,
      :no_checkboxes    => true
    )
  end

  def display_providers
    nested_list(
      ExtManagementSystem,
      :breadcrumb_title => _('Providers'),
      :association      => :nested_providers,
      :parent           => @record,
      :no_checkboxes    => true
    )
  end

  def display_ae_namespaces
    nested_list(
      MiqAeDomain,
      :breadcrumb_title => _('Automate Domains'),
      :association      => :nested_ae_namespaces,
      :parent           => @record,
      :no_checkboxes    => true
    )
  end

  OPS_X_BUTTON_ALLOWED_ACTIONS = {
    'collect_logs'              => :logs_collect,
    'collect_current_logs'      => :collect_current_logs,
    'custom_button'             => :custom_buttons,
    'delete_server'             => :delete_server,
    'demote_server'             => :demote_server,
    'fetch_audit_log'           => :fetch_audit_log,
    'fetch_log'                 => :fetch_log,
    'fetch_production_log'      => :fetch_production_log,
    'log_depot_edit'            => :log_depot_edit,
    'promote_server'            => :promote_server,
    'rbac_group_add'            => :rbac_group_add,
    'rbac_group_edit'           => :rbac_group_edit,
    'rbac_group_delete'         => :rbac_group_delete,
    'rbac_group_seq_edit'       => :rbac_group_seq_edit,
    'rbac_group_tags_edit'      => :rbac_tags_edit,
    'rbac_role_add'             => :rbac_role_add,
    'rbac_role_edit'            => :rbac_role_edit,
    'rbac_role_copy'            => :rbac_role_copy,
    'rbac_role_delete'          => :rbac_role_delete,
    'rbac_user_add'             => :rbac_user_add,
    'rbac_user_edit'            => :rbac_user_edit,
    'rbac_user_copy'            => :rbac_user_copy,
    'rbac_user_delete'          => :rbac_user_delete,
    'rbac_user_tags_edit'       => :rbac_tags_edit,
    'rbac_tenant_add'           => :rbac_tenant_add,
    'rbac_project_add'          => :rbac_tenant_add,
    'rbac_tenant_delete'        => :rbac_tenant_delete,
    'rbac_tenant_edit'          => :rbac_tenant_edit,
    'rbac_tenant_manage_quotas' => :rbac_tenant_manage_quotas,
    'rbac_tenant_tags_edit'     => :rbac_tenant_tags_edit,
    'refresh_audit_log'         => :refresh_audit_log,
    'refresh_log'               => :refresh_log,
    'refresh_production_log'    => :refresh_production_log,
    'refresh_server_summary'    => :refresh_server_summary,
    'refresh_workers'           => :refresh_workers,
    'reload_server_tree'        => :reload_server_tree,
    'restart_server'            => :restart_server,
    'restart_workers'           => :restart_workers,
    'role_start'                => :role_start,
    'role_suspend'              => :role_suspend,
    'ap_edit'                   => :ap_edit,
    'ap_delete'                 => :ap_delete,
    'ap_host_edit'              => :ap_host_edit,
    'ap_vm_edit'                => :ap_vm_edit,
    'ap_copy'                   => :ap_copy,
    'zone_collect_logs'         => :logs_collect,
    'zone_collect_current_logs' => :collect_current_logs,
    'zone_delete_server'        => :delete_server,
    'zone_demote_server'        => :demote_server,
    'zone_log_depot_edit'       => :log_depot_edit,
    'zone_promote_server'       => :promote_server,
    'zone_role_start'           => :role_start,
    'zone_role_suspend'         => :role_suspend,
    'zone_delete'               => :zone_delete,
    'zone_edit'                 => :zone_edit,
    'zone_new'                  => :zone_edit,
    'delete_build'              => :delete_build,
    'schedule_add'              => :schedule_add,
    'schedule_edit'             => :schedule_edit,
    'schedule_delete'           => :schedule_delete,
    'schedule_enable'           => :schedule_enable,
    'schedule_disable'          => :schedule_disable,
    'schedule_run_now'          => :schedule_run_now
  }.freeze

  def collect_current_logs
    assert_privileges("#{x_node.split('-').first == "z" ? "zone_" : ""}collect_current_logs")
    logs_collect(:only_current => true)
  end

  # handle buttons pressed on the center buttons toolbar
  def x_button
    generic_x_button(OPS_X_BUTTON_ALLOWED_ACTIONS)
  end

  def feature_by_button_class
    case params[:cls]
    when 'MiqGroup'
      'rbac_group_view'
    when 'Tenant'
      'rbac_tenant_view'
    when 'User'
      'rbac_user_view'
    else
      'ops_rbac'
    end
  end

  def button
    assert_privileges(feature_by_button_class)

    custom_buttons if params[:pressed] == 'custom_button'
  end

  def tree_selected_model
    @tree_selected_model = if x_node == 'root'
                             MiqRegion
                           else
                             model, id, _ = TreeBuilder.extract_node_model_and_id(x_node)
                             if model == 'Hash'
                               model = TreeBuilder.get_model_for_prefix(id)
                             end
                             model.constantize
                           end
  end

  def explorer
    @explorer = true
    @trees = []
    return if perfmenu_click?

    # if AJAX request, replace right cell, and return
    if request.xml_http_request?
      get_node_info(x_node)
      return
    end

    @timeline = @timeline_filter = true # Load timeline JS modules
    return if params[:edit_key] && !load_edit(params[:edit_key], "explorer")
    @breadcrumbs = []
    build_accordions_and_trees

    tree_selected_model

    @sb[:rails_log] = Rails.env.production? ? N_("Production") : N_("Development")

    if !params[:no_refresh]
      @sb[:good] = nil
      @sb[:buildinfo] = nil
      @sb[:activating] = false
      @build = nil
      @sb[:user] = nil
      @ldap_group = nil
    elsif @sb[:active_tab] == 'settings_tags' && %w[settings_import settings_import_tags].include?(@sb[:active_subtab])
      session[:changed] = !flash_errors?
    end
    # setting active record object here again, since they are no longer there due to redirect
    @ldap_group = @edit[:ldap_group] if params[:cls_id] && params[:cls_id].split('_')[0] == "lg"
    @x_edit_buttons_locals = set_form_locals if @in_a_form
    if @edit && (@sb[:active_tab] == 'settings_help_menu' || (@sb[:active_tab] == 'settings_tags' && !%w[settings_import settings_import_tags].include?(@sb[:active_subtab])))
      edit_changed?
    end
    # do not show buttons, when settings_workers - it uses react form buttons
    if ["settings_workers", "diagnostics_cu_repair"].include?(@sb[:active_tab])
      @x_edit_buttons_locals = nil
    end
    render :layout => "application"
  end

  def accordion_select
    session[:flash_msgs] = @flash_array = nil           # clear out any messages from previous screen i.e import tab
    self.x_active_accord = params[:id].sub(/_accord$/, '')
    self.x_active_tree   = "#{x_active_accord}_tree"

    assert_accordion_and_tree_privileges(x_active_tree)

    session[:changed] = false
    set_active_tab(x_node)
    get_node_info(x_node)
    replace_right_cell(:nodetype => @nodetype)
  end

  def tree_select
    assert_accordion_and_tree_privileges(x_active_tree)

    session[:flash_msgs] = @flash_array = nil           # clear out any messages from previous screen i.e import tab
    @sb[:active_node] ||= {}
    @sb[:action] = nil
    self.x_node = params[:id]
    tree_selected_model
    set_active_tab(params[:id])
    session[:changed] = false
    self.x_node = params[:id] #params[:action] == "x_show"
    get_node_info(params[:id])
    replace_right_cell(:nodetype => @nodetype)
  end

  def change_tab(new_tab_id = nil)
    assert_privileges(x_active_tree == :settings_tree ? "ops_settings" : "ops_diagnostics")

    @explorer = true
    params[:miq_grid_checks] = []
    session[:changed] = false
    session[:flash_msgs] = @flash_array = nil # clear out any messages from previous screen i.e import tab
    if params[:tab]
      @edit = session[:edit]
      @scan = @edit[:scan]
      case params[:tab].split("_")[0]
      when "new"
        redirect_to(:action => "ap_new", :tab => params[:tab], :id => (@scan.id || "new").to_s)
      when "edit"
        redirect_to(:action => "ap_edit", :tab => params[:tab], :id => (@scan.id || "new").to_s)
      else
        @sb[:miq_tab] = "new#{params[:tab]}"
        redirect_to(:action => "ap_edit", :tab => "edit#{params[:tab]}", :id => (@scan.id || "new").to_s)
      end
    else
      # This is an ugly hack to have 2nd level tabs for our current tab changing workflow
      # FIXME: this should be gone when we go with tabs fully implemented in angular
      if params[:parent_tab_id]
        @sb[:active_tab] = params[:parent_tab_id]
        @sb[:active_subtab] = params[:tab_id]
      else
        @sb[:active_tab] = params[:tab_id] || new_tab_id
      end

      @sb[:user] = nil
      @ldap_group = nil
      @flash_array = nil if MiqServer.my_server(true).logon_status == :ready # don't reset if flash array
      if x_active_tree == :settings_tree
        settings_get_info
        replace_right_cell(:nodetype => "root")
      elsif x_active_tree == :diagnostics_tree
        diagnostics_get_info
        case @sb[:active_tab]
        when "diagnostics_roles_servers"
          @sb[:diag_tree_type] = "roles"
          @sb[:diag_selected_id] = nil
        when "diagnostics_servers_roles"
          @sb[:diag_tree_type] = "servers"
          @sb[:diag_selected_id] = nil
        end
        diagnostics_set_form_vars
        replace_right_cell(:nodetype => "root")
      end
    end
  end

  def rbac_group_load_tab
    assert_privileges(session&.fetch_path(:edit) ? "rbac_group_edit" : "rbac_group_view")

    tab_id = params[:tab_id]
    _, group_id = TreeBuilder.extract_node_model_and_id(x_node)
    @sb[:active_rbac_group_tab] = tab_id
    @edit = session[:edit]
    explorer_opts = {}
    explorer_opts[:show_miq_buttons] = session[:changed] if @edit

    rbac_group_get_details(group_id)

    presenter = ExplorerPresenter.new(explorer_opts)

    # needed to make tooolbar Configuration > Edit still work after lazy-loading a tab
    presenter[:record_id] = group_id

    rendered = case tab_id
               when 'rbac_customer_tags'
                 r[:partial => 'ops/rbac_group/customer_tags']
               when 'rbac_hosts_clusters'
                 r[:partial => 'ops/rbac_group/hosts_clusters']
               when 'rbac_vms_templates'
                 r[:partial => 'ops/rbac_group/vms_templates']
               end

    presenter.update(tab_id, rendered)

    render :json => presenter.for_render
  end

  private ############################

  def features
    features = [
      {
        :role  => "ops_settings",
        :name  => :settings,
        :title => _("Settings")
      },
      {
        :role     => "ops_rbac",
        :role_any => true,
        :name     => :rbac,
        :title    => _("Access Control")
      },
      {
        :role  => "ops_diagnostics",
        :name  => :diagnostics,
        :title => _("Diagnostics")
      }
    ]

    features.map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def textual_group_list
    [
      %i[properties],
      %i[relationships smart_management]
    ]
  end
  helper_method :textual_group_list

  def set_active_elements(feature, _x_node_to_set = nil)
    if feature
      self.x_active_tree ||= feature.tree_name
      self.x_active_accord ||= feature.accord_name
    end
    set_active_tab_and_node
    get_node_info(x_node)
  end

  def set_active_tab_and_node
    if x_active_tree == :settings_tree
      @sb[:active_tab] ||= "settings_server"
    end

    if x_active_tree == :rbac_tree
      node = x_node(:rbac_tree)
      if node
        kind = node.split('-').first

        # default to the first tab in group detail
        @sb[:active_rbac_group_tab] = "rbac_customer_tags" if kind == 'g'
      else
        x_node_set("root", :rbac_tree)
      end

      @sb[:active_tab] ||= "rbac_details"
    end

    if x_active_tree == :diagnostics_tree
      x_node_set("svr-#{my_server.id}", :diagnostics_tree) unless x_node(:diagnostics_tree)
      @sb[:active_tab] ||= "diagnostics_summary"
    end

    @sb[:active_node] ||= {}

    if MiqServer.my_server(true).logon_status != :ready
      @sb[:active_tab]   = "diagnostics_audit_log"
      self.x_active_tree = 'diagnostics_tree'
    else
      @sb[:active_tab] ||= "settings_server"
    end
  end

  def edit_changed?
    current = @edit[:current].kind_of?(Hash) ? @edit[:current] : @edit[:current].try(:config)
    session[:changed] = @edit[:new] != current
  end

  def rbac_and_user_make_subarrays
    if @set_filter_values.present?
      temp1arr = []
      @set_filter_values = @set_filter_values.flatten
      temp_categories = @set_filter_values.dup
      temp_categories = temp_categories.sort
      i = 0
      temp_field = []
      while i < temp_categories.length
        a = temp_categories[i].rindex("/")
        current = temp_categories[i].slice(0..a)
        previous = current if previous.nil?

        if current == previous
          temp_field.push(temp_categories[i])
        else
          temp1arr.push(temp_field)
          temp_field = []
          temp_field.push(temp_categories[i])
          previous = current
        end
        i += 1
      end
      unless temp_field.nil?
        temp1arr.push(temp_field)
      end
      @set_filter_values.replace(temp1arr)
    end
  end

  def set_active_tab(nodetype)
    node = nodetype.downcase.split("-")
    case x_active_tree
    when :settings_tree
      case node[0]
      when "root"
        @sb[:active_tab] = "settings_details"
        @sb[:active_subtab] = "settings_my_company_categories"
      when "z"
        @sb[:active_tab] = "settings_evm_servers"
      when "xx", "sis", "msc", "l", "lr", "ld"
        @sb[:active_tab] = "settings_list"
      when "svr"
        @sb[:active_tab] = "settings_server"
      end
    when :rbac_tree
      @sb[:active_tab] = "rbac_details"
      # default to the first tab in group detail
      @sb[:active_rbac_group_tab] ||= "rbac_customer_tags" if node.last == 'g' || node.first == 'g'
    when :diagnostics_tree
      case node[0]
      when "root"
        @sb[:active_tab] = "diagnostics_zones"
      when "z"
        @sb[:active_tab] = "diagnostics_roles_servers"
        @sb[:diag_tree_type] = "roles"
        @sb[:diag_selected_id] = nil
      when "svr"
        @sb[:active_tab] = "diagnostics_summary"
      end
    end
  end

  def set_form_locals
    locals = {}
    if x_active_tree == :diagnostics_tree
      if @sb[:active_tab] == "diagnostics_cu_repair"
        action_url = "cu_repair"
        locals[:submit_button] = true
        locals[:submit_text] = _("Select Start date and End date to Collect C & U Data")
        locals[:no_reset] = true
        locals[:no_cancel] = true
      elsif @sb[:active_tab] == "diagnostics_collect_logs"
        action_url = "log_depot_edit"
        record_id = @record && @record.id ? @record.id : "new"
      else
        action_url = "old_dialogs_update"
        record_id = my_server.id
      end
    elsif x_active_tree == :settings_tree
      if @sb[:active_tab] == 'settings_tags' && %w[settings_import settings_import_tags].include?(@sb[:active_subtab])
        action_url = "apply_imports"
        record_id = @sb[:active_tab].split("settings_").last
        locals[:no_reset] = true
        locals[:apply_button] = true
        locals[:no_cancel] = true
        locals[:apply_method] = :post
        if @sb[:active_tab] == "settings_tags" && @sb[:active_subtab] == "settings_import"
          locals[:apply_text] = _("Apply the good VM custom variable value records")
        elsif @sb[:active_tab] == "settings_tags" && @sb[:active_subtab] == "settings_import_tags"
          locals[:apply_text] = _("Apply the good import records")
        end
      elsif @sb[:active_tab] == "settings_cu_collection"
        action_url = "cu_collection_update"
        record_id = @sb[:active_tab].split("settings_").last
        locals[:no_cancel] = true
      elsif @sb[:active_tab] == "settings_help_menu"
        action_url = "settings_update_help_menu"
        locals[:submit_button] = true
        locals[:no_cancel] = true
        locals[:no_reset] = true
      elsif %w[settings_evm_servers settings_list].include?(@sb[:active_tab]) && @in_a_form
        if %w[ap_copy ap_edit ap_host_edit ap_vm_edit].include?(@sb[:action])
          action_url = "ap_edit"
          record_id = @edit[:scan_id] ? @edit[:scan_id] : nil
        elsif %w[schedule_add schedule_edit].include?(@sb[:action])
          action_url = "schedule_edit"
          record_id = @edit[:sched_id] ? @edit[:sched_id] : nil
        elsif %w[zone_edit zone_new].include?(@sb[:action])
          locals[:serialize] = true
          action_url = "zone_edit"
          record_id = @edit[:zone_id] ? @edit[:zone_id] : nil
        end
      elsif @sb[:active_tab] == "settings_tags" && @sb[:active_subtab] == "settings_my_company_categories" && @in_a_form
        action_url = "category_edit"
        record_id = @category.try(:id)
      elsif @sb[:active_tab] == "settings_tags" && @sb[:active_subtab] == "settings_label_tag_mapping" && @in_a_form
        action_url = "label_tag_mapping_edit"
        record_id = @lt_map.try(:id)
      else
        action_url = "settings_update"
        record_id = @sb[:active_tab].split("settings_").last
        locals[:no_cancel] = true
        locals[:serialize] = true if @sb[:active_tab] == "settings_advanced"
      end
    elsif x_active_tree == :rbac_tree
      if %w[rbac_user_add rbac_user_copy rbac_user_edit].include?(@sb[:action])
        action_url = "rbac_user_edit"
        record_id = @edit[:user_id] ? @edit[:user_id] : nil
      elsif %w[rbac_role_add rbac_role_copy rbac_role_edit].include?(@sb[:action])
        action_url = "rbac_role_edit"
        record_id = @edit[:role_id] ? @edit[:role_id] : nil
      elsif %w[rbac_group_add rbac_group_edit].include?(@sb[:action])
        action_url = "rbac_group_edit"
        record_id = @edit[:group_id] ? @edit[:group_id] : nil
      elsif %w[rbac_group_tags_edit rbac_user_tags_edit rbac_tenant_tags_edit].include?(@sb[:action])
        action_url = "rbac_tags_edit"
        locals[:multi_record] = true # need save/cancel buttons on edit screen even tho @record.id is not there
        record_id = @edit[:object_ids][0]
      elsif @sb[:action] == "rbac_group_seq_edit"
        action_url = "rbac_group_seq_edit"
        locals[:multi_record] = true
      end
    end
    locals[:action_url] = action_url
    locals[:record_id] = record_id
    locals
  end

  # Get all info for the node about to be displayed
  def get_node_info(treenodeid, show_list = true)
    return if params[:cls_id] # no need to do get_node_info if redirected from show_product_update
    @nodetype = valid_active_node(treenodeid).split("-").first
    @show_list = show_list
    if @replace_trees
      @sb[:active_tab] = case x_active_tree
                         when :diagnostics_tree then 'diagnostics_zones'
                         when :settings_tree    then 'settings_details'
                         end
    end

    @explorer = true
    @nodetype = x_node.split("-").first
    case x_active_tree
    when :diagnostics_tree then diagnostics_get_info
    when :rbac_tree        then rbac_get_info
    when :settings_tree    then settings_get_info
    end

    region_text = _("[Region: %{description} [%{region}]]") % {:description => MiqRegion.my_region.description,
                                                               :region      => MiqRegion.my_region.region}
    @right_cell_text ||= case x_active_tree
                         when :diagnostics_tree then _("Diagnostics %{text}") % {:text => region_text}
                         when :settings_tree    then _("Settings %{text}") % {:text => region_text}
                         when :rbac_tree        then _("Access Control %{text}") % {:text => region_text}
                         end
    {:view => @view, :pages => @pages}
  end

  # replace_trees can be an array of tree symbols to be replaced
  def replace_right_cell(options = {})
    nodetype, replace_trees = options.values_at(:nodetype, :replace_trees)
    if params[:pressed] == "custom_button"
      presenter = set_custom_button_dialog_presenter(options)
      render :json => presenter.for_render
      return
    end
    # get_node_info might set this
    replace_trees = @replace_trees if @replace_trees
    @explorer = true
    tree_selected_model if @tree_selected_model.nil?

    locals = set_form_locals if @in_a_form
    build_supported_depots_for_select

    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)

    replace_explorer_trees(replace_trees, presenter)
    rebuild_toolbars(presenter)
    handle_bottom_cell(nodetype, presenter, locals)
    x_active_tree_replace_cell(nodetype, presenter)
    extra_js_commands(presenter)

    presenter.replace(:flash_msg_div, r[:partial => "layouts/flash_msg"]) if @flash_array
    presenter.scroll_top if @flash_array.present?
    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs']) unless %w[change_tab].include?(action_name)

    render :json => presenter.for_render
  end

  def x_active_tree_replace_cell(nodetype, presenter)
    case x_active_tree
    when :rbac_tree
      rbac_replace_right_cell(nodetype, presenter)
    when :settings_tree
      settings_replace_right_cell(nodetype, presenter)
    when :diagnostics_tree
      diagnostics_replace_right_cell(nodetype, presenter)
    end
  end

  def diagnostics_replace_right_cell(nodetype, presenter)
    # need to refresh all_tabs for server by roles and roles by servers screen
    # to show correct buttons on screen when tree node is selected
    if %w[accordion_select change_tab explorer tree_select].include?(params[:action]) ||
       %w[diagnostics_roles_servers diagnostics_servers_roles].include?(@sb[:active_tab])
      presenter.replace(:ops_tabs, r[:partial => "all_tabs"])
    elsif nodetype == "log_depot_edit"
      @right_cell_text = _("Editing Log Depot settings")
      presenter.update(:diagnostics_collect_logs, r[:partial => "ops/log_collection"])
    else
      presenter.update(@sb[:active_tab], r[:partial => "#{@sb[:active_tab]}_tab"])
    end
    # zone level
    presenter[:build_calendar] = {} if x_node.split("-").first == "z"
  end

  def settings_replace_right_cell(nodetype, presenter)
    case nodetype
    when "ze" # zone edit
      # when editing zone in settings tree
      if @zone.id.blank?
        partial_div = :settings_list
        @right_cell_text = _("Adding a new Zone")
      else
        partial_div = :settings_evm_servers
        @editing = !!@edit
        @right_cell_text = @edit ? _("Editing Zone \"%{name}\"") % {:name => @zone.description} : _("Zone \"%{name}\"") % {:name => @zone.description}
      end
      presenter[:update_partials][partial_div] = r[:partial => "zone_form"]
    when "ce" # category edit
      # when editing/adding category in settings tree
      presenter.update(:my_company_categories, r[:partial => "category_form"])
      @right_cell_text = if !@category
                           _("Adding a new Category")
                         else
                           _("Editing %{model} \"%{name}\"") % {:name => @category.description, :model => "Category"}
                         end
    when "ltme" # label tag mapping edit
      # when editing/adding label tag mapping in settings tree
      presenter.update(:settings_label_tag_mapping, r[:partial => "label_tag_mapping_form"])
      @right_cell_text = if !@lt_map
                           _("Adding a new Mapping")
                         else
                           _("Editing tag mapping from label \"%{name}\"") % {:name => @lt_map.label_name}
                         end
    when "sie" # scanitemset edit
      #  editing/adding scanitem in settings tree
      presenter.update(:settings_list, r[:partial => "ap_form"])
      @right_cell_text = if !@scan.id
                           _("Adding a new Analysis Profile")
                         else
                           @edit ? _("Editing Analysis Profile \"%{name}\"") % {:name => @scan.name} : _("Analysis Profile \"%{name}\"") % {:name => @scan.name}
                         end
    when "se" # schedule edit
      # when editing/adding schedule in settings tree
      presenter.update(:settings_list, r[:partial => "schedule_form"])
      presenter[:build_calendar] = {
        :date_from => (Time.zone.now - 1.month).in_time_zone(@edit[:tz]),
      }
      @right_cell_text = if !@schedule.id
                           _("Adding a new Schedule")
                         else
                           @edit ? _("Editing Schedule \"%{name}\"") % {:name => @schedule.name} : _("Schedule \"%{name}\"") % {:name => @schedule.name}
                         end
    else
      if %w[accordion_select change_tab tree_select].include?(params[:action])
        presenter.replace(:ops_tabs, r[:partial => "all_tabs"])
      elsif %w[zone_delete].include?(params[:pressed])
        presenter.replace(:ops_tabs, r[:partial => "all_tabs"])
      else
        tab = @sb[:active_tab] == 'settings_tags' ? @sb[:active_subtab] : @sb[:active_tab]
        presenter[:update_partials][tab] = r[:partial => "#{tab}_tab"]
      end
      active_id = x_node.split("-").last
      # server node
      if x_node.split("-").first == "svr" && my_server.id == active_id.to_i
        # show all the tabs if on current server node
        @selected_server ||= MiqServer.find(@sb[:selected_server_id]) # Reread the server record
      elsif x_node.split("-").first == "svr" && my_server.id != active_id.to_i
        # show only 4 tabs if not on current server node
        @selected_server ||= MiqServer.find(@sb[:selected_server_id]) # Reread the server record
      end
    end
  end

  def rbac_replace_right_cell(nodetype, presenter)
    if %w[accordion_select change_tab tree_select].include?(params[:action])
      presenter.replace(:ops_tabs, r[:partial => "all_tabs"])
    elsif nodetype == "group_seq"
      presenter.update(:rbac_details, r[:partial => "ldap_seq_form"])
    elsif nodetype == "tenant_edit" # schedule edit
      # when editing/adding schedule in settings tree
      presenter.update(:rbac_details, r[:partial => "tenant_form"])
      if !@tenant.id
        @right_cell_text = _("Adding a new %{tenant}") % {:tenant => tenant_type_title_string(params[:tenant_type] == "tenant")}
      else
        model = tenant_type_title_string(@tenant.divisible)
        @right_cell_text = if @edit
                             _("Editing %{model} \"%{name}\"") % {:name => @tenant.name, :model => model}
                           else
                             _("%{model} \"%{name}\"") % {:model => model, :name => @tenant.name}
                           end
      end
    elsif nodetype == "tenant_manage_quotas" # manage quotas
      # when managing quotas for a tenant
      presenter.update(:rbac_details, r[:partial => "tenant_quota_form"])
      model = tenant_type_title_string(@tenant.divisible)
      @right_cell_text = if @edit
                           _("Manage quotas for %{model} \"%{name}\"") % {:name => @tenant.name, :model => model}
                         else
                           _("%{model} \"%{name}\"") % {:model => model, :name => @tenant.name}
                         end
    elsif nodetype == 'dialog_return'
      presenter.update(:main_div, r[:partial => "detail_page"])
    else
      presenter[:update_partials][@sb[:active_tab].to_sym] = r[:partial => "#{@sb[:active_tab]}_tab"]
    end
  end

  # set all needed things before calling replace_right_cell with nodetype
  def dialog_replace_right_cell
    model, id = TreeBuilder.extract_node_model_and_id(x_node)
    @record = model.constantize.find(id)
    rbac_group_get_details(@record.id) if @record.kind_of?(MiqGroup) # set Group's trees
    replace_right_cell(:nodetype => 'dialog_return')
  end

  def extra_js_commands(presenter)
    presenter[:right_cell_text] = @right_cell_text
    presenter[:osf_node] = x_node
    presenter.reset_one_trans
    presenter.focus('server_name')
    presenter[:ajax_action] = {
      :controller => controller_name,
      :action     => @ajax_action,
      :record_id  => @record.id
    } if @ajax_action
  end

  def custom_toolbar_explorer
    if x_tree
      if @display == "main" && @record
        Mixins::CustomButtons::Result.new(:single)
      elsif @lastaction == "show_list"
        Mixins::CustomButtons::Result.new(:list)
      elsif x_tree[:tree] == :rbac_tree
        @record ? Mixins::CustomButtons::Result.new(:single) : Mixins::CustomButtons::Result.new(:list)
      else
        'blank_view_tb'
      end
    end
  end

  def choose_custom_toolbar
    if x_tree && x_tree[:tree] == :rbac_tree && x_node != 'root' && params[:action] != 'x_button'
      build_toolbar(@record ? Mixins::CustomButtons::Result.new(:single) : Mixins::CustomButtons::Result.new(:list))
    end
  end

  def rebuild_toolbars(presenter)
    c_tb = build_toolbar(center_toolbar_filename) unless @in_a_form
    presenter.reload_toolbars(:center => c_tb, :custom => choose_custom_toolbar)
    presenter[:record_id] = determine_record_id_for_presenter
  end

  def handle_bottom_cell(nodetype, presenter, locals)
    # Handle bottom cell
    if @pages || @in_a_form && locals[:action_url] != "rbac_tags_edit"
      if @pages
        presenter.hide(:form_buttons_div)
      elsif @in_a_form
        if ["log_depot_edit", "ze"].include?(nodetype)
          presenter.hide(:form_buttons_div)
        else
          presenter.update(:form_buttons_div, r[:partial => "layouts/x_edit_buttons", :locals => locals])
          presenter.show(:form_buttons_div).remove_paging
        end
      end
      presenter.show(:paging_div)
    else
      presenter.hide(:paging_div).hide(:form_buttons_div)
    end
    if ["settings_workers", "diagnostics_cu_repair"].include?(@sb[:active_tab])
      presenter.hide(:form_buttons_div)
    end
  end

  def replace_explorer_trees(replace_trees, presenter)
    # Build hash of trees to replace and optional new node to be selected
    trees = build_replaced_trees(replace_trees, %i[settings rbac diagnostics vmdb])
    reload_trees_by_presenter(presenter, trees)
  end

  def identify_tl_or_perf_record
    identify_record(@sb[:record_id], @sb[:record_class].constantize)
  end

  def get_session_data
    @title         = _("Configuration")
    @layout        = "ops"
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Configuration")},
      ],
    }
  end

  def nested_list(model, options = {})
    # Setup the instance variables for GTL.
    super # (from GenericShowMixin)

    # Update title and the content area (DOM ID 'ops_tabs')
    title = _("%{name} (All %{title})") % {
      :name  => @record.name,
      :title => options[:breadcrumb_title]
    }
    ex = ExplorerPresenter.main_div(:right_cell_text => title)
                          .update('ops_tabs', render_to_string(:partial => "layouts/gtl"))
                          .set_visibility(false, :toolbar)

    # Also update breadcrumbs.
    add_to_breadcrumbs(:title => options[:breadcrumb_title])
    ex.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    render :json => ex.for_render
  end

  menu_section :set
  feature_for_actions %w[rbac_group_add rbac_group_edit], *EXP_EDITOR_ACTIONS
  has_custom_buttons
end
