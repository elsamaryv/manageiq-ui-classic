module OpsController::Settings::AnalysisProfiles
  extend ActiveSupport::Concern

  CATEGORY_CHOICES = {
    "system"   => N_("System"),
    "services" => N_("Services"),
    "software" => N_("Software"),
    "accounts" => N_("User Accounts"),
    "vmconfig" => N_("VM Configuration")
  }.freeze

  # Show scanitemset list view
  def aps_list
    assert_privileges("ap")

    ap_build_list

    if @show_list
      update_gtl_div('aps_list') if pagination_or_gtl_request?
    end
  end

  # Show a scanitemset
  def ap_show
    # identify_scanitemset
    if @selected_scan.nil?
      flash_to_session(_("Error: Record no longer exists in the database"), :error)
      redirect_to(:action => 'show_list_set')
      return
    end
    @lastaction = "ap_show"

    @selected_scan.members.each do |a|
      case a.item_type
      when "category"
        @category = [] if @category.nil?
        (0...a[:definition]["content"].length).each do |i|
          @category.push(_(CATEGORY_CHOICES[a[:definition]["content"][i]["target"]])) if a[:definition]["content"][i]["target"] != "vmevents"
        end
      when "file"
        @file = [] if @file.nil?
        @file_stats = {}
        (0...a[:definition]["stats"].length).each do |i|
          @file_stats[a[:definition]["stats"][i]["target"].to_s] = a[:definition]["stats"][i]["content"] || false
          @file.push(a[:definition]["stats"][i]["target"])
        end
      when "registry"
        @registry = [] if @registry.nil?
        (0...a[:definition]["content"].length).each do |i|
          @registry.push(a[:definition]["content"][i])
        end
      when "nteventlog"
        @nteventlog = [] if @nteventlog.nil?
        (0...a[:definition]["content"].length).each do |i|
          @nteventlog.push(a[:definition]["content"][i])
        end
      end
    end
  end

  def ap_ce_select
    assert_privileges(session&.fetch_path(:edit, :current, :scan_mode) == "Vm" ? "ap_vm_edit" : "ap_host_edit")

    return unless load_edit("ap_edit__#{params[:id]}", "replace_cell__explorer")

    ap_get_form_vars
    if params[:edit_entry] == "edit_file"
      session[:edit_filename] = params[:file_name]
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page << "miqScrollTop();" if @flash_array.present?
        page.replace_html("ap_form_div", :partial => "ap_form", :locals => {:entry => session[:edit_filename], :edit => true})
        page << javascript_focus("entry_#{j(params[:field])}")
        page << "$('#entry_#{j(params[:field])}').select();"
      end
    elsif params[:edit_entry] == "edit_registry"
      session[:reg_data] = {}
      session[:reg_data][:key] = params[:reg_key] if params[:reg_key]
      session[:reg_data][:value] = params[:reg_value] if params[:reg_value]
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page << "miqScrollTop();" if @flash_array.present?
        page.replace("ap_form_div", :partial => "ap_form", :locals => {:entry => session[:reg_data], :edit => true})
        page << javascript_focus("entry_#{j(params[:field])}")
        page << "$('#entry_#{j(params[:field])}').select();"
      end
    elsif params[:edit_entry] == "edit_nteventlog"
      session[:nteventlog_data] = {}
      session[:nteventlog_entries].sort_by { |r| r[:name] }.each_with_index do |nteventlog, i|
        next unless i == params[:entry_id].to_i

        session[:nteventlog_data][:selected] = i
        session[:nteventlog_data][:name] = nteventlog[:name]
        session[:nteventlog_data][:message] = nteventlog[:filter][:message]
        session[:nteventlog_data][:level] = nteventlog[:filter][:level]
        session[:nteventlog_data][:num_days] = nteventlog[:filter][:num_days].to_i
        session[:nteventlog_data][:source] = nteventlog[:filter][:source]
      end

      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page << "miqScrollTop();" if @flash_array.present?
        page.replace("ap_form_div", :partial => "ap_form", :locals => {:entry => session[:nteventlog_data], :edit => true})
        page << javascript_focus("entry_#{j(params[:field])}")
        page << "$('#entry_#{j(params[:field])}').select();"
      end
    else
      session[:edit_filename] = ""
      session[:reg_data] = {}
      session[:nteventlog_data] = {}
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page << "miqScrollTop();" if @flash_array.present?
        page.replace("ap_form_div", :partial => "ap_form", :locals => {:entry => "new", :edit => true})
        page << javascript_focus('entry_name')
        page << "$('#entry_name').select();"
      end
    end
  end

  # AJAX driven routine to delete a classification entry
  def ap_ce_delete
    assert_privileges("ap_delete")

    return unless load_edit("ap_edit__#{params[:id]}", "replace_cell__explorer")

    ap_get_form_vars
    if params[:item2] == "registry"
      session[:reg_entries].each do |reg|
        if reg.value?(params[:reg_key]) && reg.value?(params[:reg_value])
          session[:reg_entries].delete(reg)
        end
      end
      @edit[:new]["registry"][:definition]["content"].each do |reg_keys|
        if reg_keys["key"] == params[:reg_key] && reg_keys["value"] == params[:reg_value]
          @edit[:new]["registry"][:definition]["content"].delete(reg_keys)
        end
      end
    elsif params[:item2] == "nteventlog"
      session[:nteventlog_entries].sort_by { |r| r[:name] }.each_with_index do |nteventlog, i|
        if i == params[:entry_id].to_i
          session[:nteventlog_entries].delete(nteventlog)
          @edit[:nteventlog_entries].delete(nteventlog) if @edit[:nteventlog_entries].present?
        end
      end
      @edit[:new]["nteventlog"][:definition]["content"].sort_by { |r| r[:name] }.each_with_index do |nteventlog_keys, i|
        if nteventlog_keys[:name] == params[:nteventlog_name] && i == params[:entry_id].to_i
          @edit[:new]["nteventlog"][:definition]["content"].delete(nteventlog_keys)
        end
      end
    else
      session[:file_names].each do |file_name|
        if file_name["target"] == params[:file_name]
          session[:file_names].delete(file_name)
        end
      end
      @edit[:new]["file"][:definition]["stats"].each do |fname|
        if fname["target"] == params[:file_name]
          @edit[:new]["file"][:definition]["stats"].delete(fname)
        end
      end
    end
    @edit[:new] = ap_sort_array(@edit[:new])
    @edit[:current] = ap_sort_array(@edit[:current])
    changed = (@edit[:new] != @edit[:current])
    render :update do |page|
      page << javascript_prologue
      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page << "miqScrollTop();" if @flash_array.present?
      page.replace("ap_form_div", :partial => "ap_form", :locals => {:entry => "new", :edit => false})
      page << javascript_for_miq_button_visibility(changed)
    end
  end

  def ap_copy
    assert_privileges("ap_copy")
    @_params[:typ] = "copy"
    ap_edit
  end

  def ap_host_edit
    assert_privileges("ap_host_edit")
    @_params[:typ] = "Host"
    ap_edit
  end

  def ap_vm_edit
    assert_privileges("ap_vm_edit")
    @_params[:typ] = "Vm"
    ap_edit
  end

  def ap_edit
    assert_privileges("ap_edit")
    if params["accept"]
      ap_accept_line_changes
    else
      case params[:button]
      when "cancel"
        @scan = ScanItemSet.find(session[:edit][:scan_id]) if session[:edit][:scan_id]
        if @scan
          add_flash(_("Edit of Analysis Profile \"%{name}\" was cancelled by the user") % {:name => @scan.name})
        else
          add_flash(_("Add of new Analysis Profile was cancelled by the user"))
        end
        get_node_info(x_node)
        #       @scan = @edit[:scan] = nil
        @scan = nil
        #       @edit = session[:edit] = nil  # clean out the saved info
        replace_right_cell(:nodetype => @nodetype)
      when "save", "add"
        id = params[:button] == "add" ? "new" : params[:id]
        return unless load_edit("ap_edit__#{id}", "replace_cell__explorer")

        @scan = ScanItemSet.find_by_id(@edit[:scan_id])
        ap_get_form_vars

        category, nteventlog, registry = %w[category nteventlog registry].map do |x|
          @edit[:new].fetch_path(x, :definition, 'content')
        end
        file = @edit[:new].fetch_path('file', :definition, 'stats')

        if [category, nteventlog, registry, file].all?(&:blank?)
          add_flash(_("At least one item must be entered to create Analysis Profile"), :error)
          @sb[:miq_tab] = @edit[:new][:scan_mode] == "Host" ? "edit_2" : "edit_1"
          @edit[:new] = ap_sort_array(@edit[:new])
          @edit[:current] = ap_sort_array(@edit[:current])
          @changed = session[:changed] = (@edit[:new] != @edit[:current])
          javascript_flash
        else
          scanitemset = params[:button] == "add" ? ScanItemSet.new : ScanItemSet.find(@edit[:scan_id]) # get the current record
          ap_set_record_vars_set(scanitemset)

          if scanitemset.valid? && !@flash_array
            scanitemset.save
            mems = scanitemset.members
            ap_set_record_vars(mems, scanitemset)
            begin
              # mems.each { |c| scanitemset.remove_member(ScanItem.find(c)) if !mems.include?(c.id) }
              # scanitemset.remove_all_members
              # scanitemset.add_member()
            rescue => bang
              title = params[:button] == "add" ? "add" : "update"
              add_flash(_("Error during '%{title}': %{message}") % {:title => title, :message => bang.message}, :error)
            end
            if params[:button] == "save"
              AuditEvent.success(build_saved_audit(scanitemset, @edit))
            else
              AuditEvent.success(build_created_audit(scanitemset, @edit))
            end
            add_flash(_("Analysis Profile \"%{name}\" was saved") % {:name => get_record_display_name(scanitemset)})
            aps_list
            @scan = @edit[:scan_id] = nil
            @edit = session[:edit] = nil # clean out the saved info
            self.x_node = "xx-sis" if params[:button] == "add"
            get_node_info(x_node)
            replace_right_cell(:nodetype => x_node, :replace_trees => [:settings])
          else
            scanitemset.errors.each do |error|
              add_flash("#{_(error.attribute.to_s.capitalize)} #{error.message}", :error)
            end
            @edit[:new] = ap_sort_array(@edit[:new])
            @edit[:current] = ap_sort_array(@edit[:current])
            @changed = session[:changed] = (@edit[:new] != @edit[:current])
            # ap_build_edit_screen
            javascript_flash
          end
        end
      when "reset", nil
        if params[:button] == "reset" || %w[ap_copy ap_edit].include?(@sb[:action])
          obj = find_record_with_rbac(ScanItemSet, checked_or_params)
        end
        if !params[:tab] && params[:typ] != "copy" # if tab was not changed
          if !params[:typ] || params[:button] == "reset"
            @scan = obj
            @sb[:miq_tab] = @scan.mode == "Host" ? "edit_2" : "edit_1"
            if @scan.read_only
              add_flash(_("Sample Analysis Profile \"%{name}\" can not be edited") % {:name => @scan.name}, :error)
              get_node_info(x_node)
              replace_right_cell(:nodetype => @nodetype)
              return
            end
          else
            @scan = ScanItemSet.new           # Get existing or new record
            @scan.mode = params[:typ] if params[:typ]
            @sb[:miq_tab] = @scan.mode == "Host" ? "new_2" : "new_1"
            @edit = session[:edit]
          end
        end
        if params[:typ] == "copy"
          session[:set_copy] = "copy"
          scanitemset = obj
          @scan = ScanItemSet.new
          @scan.name = "Copy of " + scanitemset.name
          @scan.description = scanitemset.description
          @scan.mode = scanitemset.mode
          ap_set_form_vars
          scanitems = scanitemset.members     # Get the member sets
          scanitems.each_with_index do |scanitem, _i|
            @edit[:new][scanitem.item_type] = {}
            @edit[:new][scanitem.item_type][:name] = scanitem.name
            @edit[:new][scanitem.item_type][:description] = scanitem.description
            @edit[:new][scanitem.item_type][:definition] = scanitem.definition
            @edit[:new][scanitem.item_type][:type] = scanitem.item_type
            session[:file_names] = @edit[:new][scanitem.item_type][:definition]["stats"].dup unless @edit[:new][scanitem.item_type][:definition]["stats"].nil?
            session[:reg_entries] = @edit[:new]["registry"][:definition]["content"].dup unless @edit[:new]["registry"].nil?
            session[:nteventlog_entries] = @edit[:new]["nteventlog"][:definition]["content"].dup unless @edit[:new]["nteventlog"].nil?
          end
          @sb[:miq_tab] = @scan.mode == "Host" ? "edit_2" : "edit_1"
        else
          ap_set_form_vars unless params[:tab]
        end
        if params[:tab] # only if tab was changed
          return unless load_edit("ap_edit__#{params[:id]}", "replace_cell__explorer")
        end
        ap_build_edit_screen
        @sb[:ap_active_tab] = @edit[:new][:scan_mode] == "Host" ? "file" : "category"
        if params[:button] == "reset"
          add_flash(_("All changes have been reset"), :warning)
        end
        @edit[:new] = ap_sort_array(@edit[:new])
        @edit[:current] = ap_sort_array(@edit[:current])
        @changed = session[:changed] = (@edit[:new] != @edit[:current])
        replace_right_cell(:nodetype => "sie")
      end
    end
  end

  def ap_set_active_tab
    assert_privileges(session&.fetch_path(:edit, :current, :scan_mode) == "Vm" ? "ap_vm_edit" : "ap_host_edit")

    @sb[:ap_active_tab] = params[:tab_id]
    @edit = session[:edit]
    @scan = session[:edit][:scan]
    render :update do |page|
      page << javascript_prologue
      page << "miqSparkle(false);"
    end
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def ap_form_field_changed
    assert_privileges(session&.fetch_path(:edit, :current, :scan_mode) == "Vm" ? "ap_vm_edit" : "ap_host_edit")

    return unless load_edit("ap_edit__#{params[:id]}", "replace_cell__explorer")

    ap_get_form_vars
    @edit[:new] = ap_sort_array(@edit[:new])
    @edit[:current] = ap_sort_array(@edit[:current])
    changed = (@edit[:new] != @edit[:current])
    ap_build_edit_screen

    render :update do |page|
      page << javascript_prologue
      page << javascript_for_miq_button_visibility_changed(changed)
    end
  end

  # Delete all selected or single displayed scanitemset(s)
  def ap_delete
    assert_privileges("ap_delete")
    @single_delete = params[:id].present?
    scanitemsets = find_records_with_rbac(ScanItemSet, checked_or_params)
    scanitemsets.each do |scan_item_set|
      if scan_item_set.read_only
        scanitemsets -= [scan_item_set]
        add_flash(_("Default Analysis Profile \"%{name}\" can not be deleted") % {:name => scan_item_set.name}, :error)
      else
        tmp_flash_array = @flash_array
        ap_deletescanitems(scan_item_set.members)
        @flash_array = tmp_flash_array
        scan_item_set.remove_all_members
      end
    end
    @flash_error = scanitemsets.empty?
    ap_process_scanitemsets(scanitemsets, "destroy") unless scanitemsets.empty?
    self.x_node = "xx-sis"
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node, :replace_trees => [:settings])
  end

  private

  def ap_accept_line_changes
    return unless load_edit("ap_edit__#{params[:id]}", "replace_cell__explorer")

    ap_get_form_vars
    @edit[:new] = ap_sort_array(@edit[:new])
    @edit[:current] = ap_sort_array(@edit[:current])
    @changed = session[:changed] = (@edit[:new] != @edit[:current])
    render :update do |page|
      page << javascript_prologue
      page.replace("ap_form_div", :partial => "ap_form")
      page << javascript_for_miq_button_visibility(@changed)
    end
  end

  # Create the view and associated vars for the ap list
  def ap_build_list
    @lastaction = "aps_list"
    @force_no_grid_xml = true
    @view, @pages = get_view(ScanItemSet) # Get the records (into a view) and the paginator
    @current_page = @pages[:current] unless @pages.nil? # save the current page number
  end

  # Copy a hash, duplicating any embedded hashes/arrays contained within
  def ap_sort_array(hashin, skip_key = nil)
    hashout = {}
    hashin.each do |key, value|
      if skip_key && key == skip_key # Skip this key, if passed in
        next
      elsif value.kind_of?(Hash)
        hashout[key] = ap_sort_array(value, skip_key)
      elsif value.kind_of?(Array)
        @items = value.sort_by do |item|
          if item.key?("target")
            item["target"].to_s
          elsif item.key?(:name)
            item[:name].to_s
          else
            item["key"].to_s
          end
        end
        hashout[key] = @items
      else
        hashout[key] = value
      end
    end
    hashout
  end

  # Set record variables to new values
  def ap_set_record_vars_set(scanitemset)
    scanitemset.name = (@edit[:new].fetch(:name, '') || '').strip
    scanitemset.description = (@edit[:new].fetch(:description, '') || '').strip
    scanitemset.mode = @edit[:new][:scan_mode]
  end

  # Set record variables to new values
  def ap_set_record_vars(mems, scanitemset)
    unless mems.empty?
      mems_to_delete = []
      mems.each { |m| mems_to_delete.push(m) }
      ap_deletescanitems(mems_to_delete)
      scanitemset.remove_all_members
    end

    [
      %w[category content],
      %w[file stats],
      %w[registry content],
      %w[nteventlog content]
    ].each do |key, definition_key|
      next if @edit[:new][key].blank?

      scanitem             = ScanItem.new
      scanitem.name        = "#{scanitemset.name}_#{@edit[:new][key][:type]}"
      scanitem.description = "#{scanitemset.description} #{@edit[:new][key][:type]} Scan"
      scanitem.item_type   = @edit[:new][key][:type]
      scanitem.definition  = copy_hash(@edit[:new][key][:definition])
      next if scanitem.definition[definition_key].empty?

      begin
        scanitem.save
        scanitemset.add_member(scanitem)
        # resetting flash_array to not show a message for each memmber that is saved for a scanitemset
        @flash_array = []
      rescue => bang
        add_flash(_("Analysis Profile \"%{name}\": Error during 'update': %{message}") %
                    {:name => scanitem.name, :message => bang.message}, :error)
      end
    end
  end

  # Set form variables for edit
  def ap_set_form_vars
    @edit = {}
    session[:file_names] = []
    session[:reg_entries] = []
    session[:nteventlog_entries] = []
    @edit[:scan_id] = @scan.id
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "ap_edit__#{@scan.id || "new"}"

    @edit[:new][:name] = @scan.name
    @edit[:new][:scan_mode] = @scan.mode
    @edit[:new][:description] = @scan.description

    scanitems = @scan.members # Get the member sets

    # @edit[:new][:items] = Array.new
    scanitems.each_with_index do |scanitem, _i|
      @edit[:new][scanitem.item_type] = {}
      # @edit[:new][scanitem.item_type][:id] = scanitem.id
      @edit[:new][scanitem.item_type][:name] = scanitem.name
      @edit[:new][scanitem.item_type][:description] = scanitem.description
      @edit[:new][scanitem.item_type][:definition] = scanitem.definition.dup
      @edit[:new][scanitem.item_type][:type] = scanitem.item_type
      session[:file_names] = @edit[:new][scanitem.item_type][:definition]["stats"].dup unless @edit[:new][scanitem.item_type][:definition]["stats"].nil?
      session[:reg_entries] = @edit[:new]["registry"][:definition]["content"].dup unless @edit[:new]["registry"].nil?
      session[:nteventlog_entries] = @edit[:new]["nteventlog"][:definition]["content"].dup unless @edit[:new]["nteventlog"].nil?
    end

    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end

  def ap_get_form_vars_category
    item_type = params[:item_type]
    @edit[:new][item_type] ||= {}
    @edit[:new][item_type][:type] = params[:item_type]
    @edit[:new][item_type][:definition] = {} if @edit[:new][item_type][:definition].nil?
    @edit[:new][item_type][:definition]["content"] ||= []
    temp = {}
    CATEGORY_CHOICES.each_key do |checkbox_name|
      if params["check_#{checkbox_name}"]
        temp["target"] = checkbox_name
        if params["check_#{checkbox_name}"] == "null"
          @edit[:new][item_type][:definition]["content"].delete(temp)
          temp = {}
        end
      end
      @edit[:new][item_type][:definition]["content"].push(temp) if !temp.empty? && !@edit[:new][item_type][:definition]["content"].include?(temp)
      temp = {}
    end
  end

  def ap_get_form_vars_file
    if params[:entry]['fname'].blank?
      add_flash(_("File Entry is required"), :error)
      return
    end
    item_type = params[:item]['type1']
    @edit[:file_names] = session[:file_names].empty? ? [] : session[:file_names].dup
    unless @edit[:file_names].nil?
      @edit[:file_names].delete_if { |fn| fn['target'] == session[:edit_filename] }

      found = !!@edit[:file_names].find { |fn| fn['target'] == params[:entry]['fname'] }

      if !found && params[:entry]['fname'].present?
        @edit[:file_names].push(
          'target'  => params[:entry]['fname'],
          'content' => !!params[:entry_content]
        )
      end
    end
    session[:file_names] = @edit[:file_names].dup
    @edit[:new][item_type] = {
      :type       => item_type,
      :definition => {"stats" => []},
    }
    session[:file_names].each do |fname|
      @edit[:new][item_type][:definition]["stats"].push(fname.dup) unless fname.empty?
    end
    session[:edit_filename] = nil
  end

  def ap_get_form_vars_registry
    unless params[:entry]['kname'].present? && params[:entry]['value'].present?
      session[:reg_data] = {
        :key   => params[:entry]['kname'],
        :value => params[:entry]['value'],
      }
      add_flash(_("Registry Entry is required"), :error)
      return
    end
    session[:reg_data] = {}

    item_type = params[:item]['type2']
    @edit[:reg_entries] = session[:reg_entries].empty? ? [] : session[:reg_entries].dup

    @edit[:reg_entries].delete_if do |regentry|
      regentry['key'] == session[:reg_data][:key] &&
        regentry['value'] == session[:reg_data][:value]
    end

    found = false
    if params[:entry] && params[:entry][:id]

      entry_index    = params[:entry][:id].to_i
      sorted_entries = session[:reg_entries].sort_by { |r| r['key'] }

      if entry_index < sorted_entries.length
        regentry = sorted_entries[entry_index]
        regentry.update(
          'depth' => 0,
          'hive'  => 'HKLM',
          'value' => params[:entry]['value'],
          'key'   => params[:entry]['kname']
        )
        found = true
      end
    end

    unless found
      @edit[:reg_entries].push(
        'depth' => 0,
        'hive'  => 'HKLM',
        'value' => params[:entry]['value'],
        'key'   => params[:entry]['kname']
      )
    end

    session[:reg_entries] = @edit[:reg_entries].dup
    @edit[:new][item_type] = {
      :type       => item_type,
      :definition => {'content' => []}
    }

    session[:reg_entries].each do |entry|
      @edit[:new][item_type][:definition]['content'].push(entry.dup) unless entry.empty?
    end
  end

  def ap_get_form_vars_event_log
    session[:nteventlog_data] = {}
    if params[:entry]["name"] == ""
      session[:nteventlog_data][:name] = params[:entry]["name"]
      session[:nteventlog_data][:message] = params[:entry]["message"]
      session[:nteventlog_data][:level] = params[:entry]["level"]
      # session[:nteventlog_data][:rec_count] = params[:entry]["rec_count"].to_i
      session[:nteventlog_data][:num_days] = params[:entry]["num_days"].to_i
      session[:nteventlog_data][:source] = params[:entry]["source"]
      add_flash(_("Event log name is required"), :error)
      return
    end
    item_type = params[:item]["type3"]
    @edit[:new][item_type] = {}
    @edit[:nteventlog_entries] = [] if @edit[:nteventlog_entries].nil?
    @edit[:nteventlog_entries] = session[:nteventlog_entries].dup if session[:nteventlog_entries].present?
    temp = {}
    unless @edit[:nteventlog_entries].nil?
      if params[:item]["id"]
        @edit[:nteventlog_entries].sort_by { |r| r[:name] }.each_with_index do |_nteventlog, i|
          next unless i == params[:item]["id"].to_i

          @edit[:nteventlog_entries][i][:name] = params[:entry]["name"]
          @edit[:nteventlog_entries][i][:filter][:message] = params[:entry]["message"]
          @edit[:nteventlog_entries][i][:filter][:level] = params[:entry]["level"]
          @edit[:nteventlog_entries][i][:filter][:num_days] = params[:entry]["num_days"].to_i
          @edit[:nteventlog_entries][i][:filter][:source] = params[:entry]["source"]
        end
      else
        temp[:name] = params[:entry]["name"]
        temp[:filter] = {}
        temp[:filter][:message] = params[:entry]["message"]
        temp[:filter][:level] = params[:entry]["level"]
        # temp[:filter][:rec_count] = params[:entry]["rec_count"].to_i
        temp[:filter][:num_days] = params[:entry]["num_days"].to_i
        temp[:filter][:source] = params[:entry]["source"]
        @edit[:nteventlog_entries].push(temp)
      end
    end
    session[:nteventlog_entries] = @edit[:nteventlog_entries].dup
    @edit[:new][item_type][:type] = params[:item]["type3"]
    @edit[:new][item_type][:definition] = {} if @edit[:new][item_type][:definition].nil?
    @edit[:new][item_type][:definition]["content"] = [] if @edit[:new][item_type][:definition]["content"].nil?
    session[:nteventlog_entries].each do |fname|
      temp = fname.dup
      @edit[:new][item_type][:definition]["content"].push(temp) unless temp.empty?
    end
  end

  # Get variables from edit form
  def ap_get_form_vars
    @scan = @edit[:scan_id] ? ScanItemSet.find(@edit[:scan_id]) : ScanItemSet.new
    @edit[:new][:name]        = params[:name]        if params[:name]
    @edit[:new][:description] = params[:description] if params[:description]

    if params[:item].present? || params[:item_type].present?
      ap_get_form_vars_category if @sb[:ap_active_tab] == "category"
      if @edit[:new]["category"]
        @edit[:new]["category"][:name] = "#{params[:name]}_category" if params[:name]
        if params[:description]
          @edit[:new]["category"][:description] = _("%{description} category Scan") %
                                                  {:description => params[:description]}
        end
      end

      ap_get_form_vars_file if @sb[:ap_active_tab] == "file" && params[:item] && params[:item]["type1"]
      if @edit[:new]["file"]
        @edit[:new]["file"][:name] = "#{params[:name]}_file" if params[:name]
        if params[:description]
          @edit[:new]["file"][:description] = "%{description} file Scan" % {:description => params[:description]}
        end
      end

      ap_get_form_vars_registry if @sb[:ap_active_tab] == "registry"
      if @edit[:new]["registry"]
        @edit[:new]["registry"][:name] = "#{params[:name]}_registry" if params[:name]
        if params[:description]
          @edit[:new]["registry"][:description] = _("%{description} registry Scan") %
                                                  {:description => params[:description]}
        end
      end

      ap_get_form_vars_event_log if @sb[:ap_active_tab] == "event_log"
      if @edit[:new]["nteventlog"]
        @edit[:new]["nteventlog"][:name]        = "#{params[:name]}_nteventlog"             if params[:name]
        @edit[:new]["nteventlog"][:description] = "#{params[:description]} nteventlog Scan" if params[:description]
      end
    end
  end

  def ap_build_edit_screen
    @embedded = true # don't show flash msg or check boxes in analysis profiles partial
    @scan = @edit[:scan_id] ? ScanItemSet.find(@edit[:scan_id]) : ScanItemSet.new
    @sb[:req] = "new" if %w[new copy create].include?(request.parameters["action"]) || %w[copy Host Vm].include?(params[:typ])
    @sb[:req] = "edit" if %w[edit update].include?(request.parameters["action"]) || params[:typ] == "edit"
    @scan.members.each do |a|
      case a.item_type
      when "category"
        @category = [] if @category.nil?
        @category.push(a)
      when "file"
        @file = [] if @file.nil?
        @file.push(a)
      when "registry"
        @registry = [] if @registry.nil?
        @registry.push(a)
      when "nteventlog"
        @nteventlog = [] if @nteventlog.nil?
        @nteventlog.push(a)
      end
    end
    # @sb[:miq_id] = params[:id] if params[:id]
    session[:reg_data] = {} if params[:entry].nil?
    session[:nteventlog_data] = {} if params[:entry].nil?
    session[:edit_filename] = []
    @in_a_form = true
  end

  # Delete all selected or single displayed scanitemset(s)
  def ap_deletescanitems(scanitems)
    ap_process_scanitems(scanitems, "destroy")
  end

  # Common scanitemset Set button handler routines follow
  def ap_process_scanitems(scanitems, task)
    process_elements(scanitems, ScanItem, task)
  end

  # Common scanitemset button handler routines follow
  def ap_process_scanitemsets(scanitemsets, task)
    process_elements(scanitemsets, ScanItemSet, task)
  end
end
