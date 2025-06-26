/* eslint-disable radix */
import React, { useState, useRef, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import {
  Tabs, Tab, Button, TextInput, TextArea, Modal, ModalBody,
} from 'carbon-components-react';
import { AddAlt16 } from '@carbon/icons-react';
import {
  dynamicComponents, defaultTabContents, defaultSectionContents, createNewTab, dragItems, saveServiceDialog
} from './data';
import TabOptionsMenu from './tab-options-menu';
import DynamicComponentChooser from './dynamic-component-chooser';
import './style.scss';
import DynamicSection from './dynamic-section';
import {
  selectedTab, SD_ACTIONS, dropField, dropSection, dropComponent,
} from './helper';
import EditTabModal from './edit-tab-modal';
import EditSectionModal from './edit-section-modal';
import { createSchema as SectionEditSchema } from './edit-section-modal/modal-fields.schema';


const ServiceDialogForm = () => {
  let dragEnterItem = useRef(); /** Stores the information of component where the dragged item is being hovered before release. */
  let draggedItem = useRef(); /** Stores the information of component being dragged. */
  let hoverItem = useRef(); /** Stores the tab and section position during the drop event. */  

  const [data, setData] = useState({
    list: dynamicComponents,
    formFields: [defaultTabContents(0), createNewTab()],
  });

  const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);

  const evaluateSubmitButton = () => {
    // checks if any of the sections in any tabs has fields added
    const hasFields = data.formFields.some((tab) =>
      tab.sections.some((section) => section.fields.length > 0));

    // checks if dialog label is present
    const hasDialogLabel = (Object.prototype.hasOwnProperty.call(data, 'label') && data.label.trim() !== '');

    setIsSubmitButtonEnabled(hasDialogLabel && hasFields);
  };

  useEffect(() => {
    evaluateSubmitButton();
  }, [data]);

  const onDragEnterSection = ({ section }) => {
    if (draggedItem.type === dragItems.SECTION) {
      dragEnterItem = { section };
    }
  };

  /** Function which gets executed when a dragged field item is on top of another field item. */
  const onDragEnterField = ({ section, fieldPosition }) => {
    if (draggedItem.type === dragItems.FIELD) {
      dragEnterItem = { section, fieldPosition };
    }
  };

  /** Function which gets executed once when a compnent dragging has started */
  const onDragStartComponent = (event, type) => {
    draggedItem = { componentId: parseInt(event.currentTarget.id), type };
  };

  const onDragStartSection = ({ section }) => {
    if (draggedItem && draggedItem.type === dragItems.FIELD) {
      return;
    }
    draggedItem = { sectionId: section.sectionId, type: dragItems.SECTION };
  };

  /** Function which gets executed once when a dragging has started */
  const onDragStartField = ({ fieldPosition, section: { sectionId } }) => {
    if (draggedItem && draggedItem.type === dragItems.SECTION) {
      return;
    }
    draggedItem = { fieldPosition, sectionId, type: dragItems.FIELD };
  };

  /** Function which gets executed on dropping an item */
  const onDrop = () => {
    if (draggedItem && hoverItem) {
      const tab = selectedTab([...data.formFields], hoverItem.tabPosition);
      const section = [...tab.sections].find((section) => section.sectionId === hoverItem.sectionPosition);
      switch (draggedItem.type) {
        case dragItems.COMPONENT:
          dropComponent(section, draggedItem);
          break;
        case dragItems.FIELD:
          dropField(section, draggedItem, dragEnterItem);
          break;
        case dragItems.SECTION:
          dropSection(tab, draggedItem, dragEnterItem);
          break;
        default:
          break;
      }
      setData({
        ...data,
        formFields: [...data.formFields],
      });
      hoverItem = undefined;
      draggedItem = undefined;
    }
  };

  /** Function which gets executed while the element is being dragged.
   * This function works like a listener */
  const onDragOverListener = ({ event }) => {
    event.preventDefault();
    const tabPosition = parseInt(event.currentTarget.getAttribute('tab'));
    const sectionPosition = parseInt(event.currentTarget.getAttribute('section'));
    hoverItem = { tabPosition, sectionPosition };
  };

  /** Function to add a tab as the second last item
   * Last item will always be 'Create new tab'.
   */
  const addTab = () => {
    data.formFields.splice(-1, 0, defaultTabContents(data.formFields.length - 1));
    const newFormFields = data.formFields.sort((t1, t2) => t1.tabId - t2.tabId);
    setData({
      ...data,
      formFields: [...newFormFields],
    });
  };

  /** Function to add a section */
  const addSection = (tabPosition) => {
    const { sections } = selectedTab(data.formFields, tabPosition);
    sections.push(defaultSectionContents(tabPosition, sections.length));
    setData({
      ...data,
      formFields: [...data.formFields],
    });
  };

  const editSection = ({ section }) => {
    debugger
    return (
      <EditSectionModal
        sectionName={section.title}
        // showModal={showTabEditModal}
        showModal
        onSave={(e, editedValues) => {
        // setState((state) => ({ ...state, showModal: false }));
          console.log("onSave triggered", editedValues);
        }}
        onModalHide={onModalHide}
      />
    );
  };

  /** Function to delete a section */
  const deleteSection = ({ section: { tabId, sectionId } }) => {
    const tab = selectedTab(data.formFields, tabId);
    tab.sections = tab.sections.filter((section) => section.sectionId !== sectionId);
    setData({
      ...data,
      formFields: [...data.formFields],
    });
  };

  /** Function to delete a field */
  const deleteField = ({ section, fieldPosition }) => {
    const otherFields = section.fields.filter((_field, index) => index !== fieldPosition);
    section.fields = otherFields;
    setData({
      ...data,
      formFields: [...data.formFields],
    });
  };

  /** Function to handle the tab click event. */
  const onTabSelect = (tabId) => {
    if (tabId === 'new') {
      addTab();
    }
  };

  const [showTabEditModal, setShowTabEditModal] = useState(false);
  const [selTab, setSelTab] = useState(null);

  
  const onModalHide = () => setShowTabEditModal(false);
  const onModalShow = () => {
    setShowTabEditModal(true);
  };

  /** Function to delete a tab */
  const deleteTab = (tab) => {
    setData({
      ...data,
      formFields: [...data.formFields].filter((item) => item.tabId !== tab.tabId),
    });
  };

  /** Function to handle the tab Actions from menu. */
  const tabAction = (actionType, tab) => {
    switch (actionType) {
      case SD_ACTIONS.tab.edit:
        setSelTab(tab);
        setShowTabEditModal(true);
        break;
      case SD_ACTIONS.tab.delete:
        return deleteTab(tab);
      default:
        return null;
    }
  };

  /** Function to handle text area field update */
  const handlePropertiesEdit = ({ section, fieldPosition, inputProps }) => {
    const { tabId, sectionId } = section;

    const fieldVal = data.formFields[tabId].sections[sectionId].fields[fieldPosition];
    const newFieldVal = { ...fieldVal, ...inputProps };

    data.formFields[tabId].sections[sectionId].fields[fieldPosition] = newFieldVal;
    setData({
      ...data,
    });
  };

  /** Function to handle the call back actions from section. */
  /** TODO: Change this to Redux */
  // TODO: fieldPosition will only appeare for field drag and drop. Needs to change the logic.
  const onSectionAction = (actionData) => {
    switch (actionData.type) {
      case SD_ACTIONS.onDrop:
        return onDrop();
      case SD_ACTIONS.onDragOverListener:
        return onDragOverListener(actionData);
      case SD_ACTIONS.onDragEnterSection:
        return onDragEnterSection(actionData);
      case SD_ACTIONS.onDragEnterField:
        return onDragEnterField(actionData);
      case SD_ACTIONS.onDragStartField:
        return onDragStartField(actionData);
      case SD_ACTIONS.onDragStartSection:
        return onDragStartSection(actionData);
      case SD_ACTIONS.section.edit:
        return editSection(actionData);
      case SD_ACTIONS.section.delete:
        return deleteSection(actionData);
      case SD_ACTIONS.field.delete:
        return deleteField(actionData);
      case SD_ACTIONS.field.edit:
        return handlePropertiesEdit(actionData);
      default:
        return undefined;
    }
  };

  /* *****************************************
   * Render function begins from here
   * ***************************************** */

  /** Function to render the Tab's name. */
  const renderTabName = (tab) => (
    <div className="dynamic-tab-name">
      <TabOptionsMenu
        tabId={tab.tabId}
        onTabAction={(actionType) => tabAction(actionType, tab)}
      />
      <h2>{tab.name}</h2>
    </div>
  );

  /** Function to render the sections under a tab. */
  const renderSections = ({ tabId, sections }) => sections && sections.map((section, sectionPosition) => (
    <DynamicSection
      key={sectionPosition.toString()}
      section={section}
      // event, section, type, fieldPosition, inputProps,
      sectionAction={(type, event, inputProps) => onSectionAction(type, tabId, section.sectionId, event, inputProps)}
    />
  ));

  /** Function to render the add section button */
  const renderAddSectionButton = (tabPosition) => (
    <div className="add-section-button-wrapper">
      <Button
        renderIcon={AddAlt16}
        kind="primary"
        iconDescription={__('Add Section')}
        className="add-section-button"
        onClick={() => addSection(tabPosition)}
        onKeyPress={() => addSection(tabPosition)}
        title={__('Click to add a new section')}
      >
        {__(`Add Section`)}
      </Button>
    </div>
  );

  /** Function to render the tabs from the tabLabels props */
  const renderTabs = () => data.formFields.map((tab, tabPosition) => (
    <Tab
      key={`tab${tabPosition.toString()}`}
      label={tab.name}
      onClick={() => onTabSelect(tab.tabId)}
    >
      {tab.tabId !== 'new'
      && (
        <section className="dynamic-sections-wrapper">
          {renderTabName(tab)}
          {renderSections(tab)}
          {renderAddSectionButton(tab.tabId)}
        </section>
      )}

    </Tab>
  ));

  /** Function to render the tab contents. */
  const renderTabContents = () => (
    <div className="dynamic-tabs-wrapper">
      <Tabs className="miq_custom_tabs" id="dynamic-tabs">
        {renderTabs()}
      </Tabs>
    </div>
  );

  const handleSubmit = () => {
    saveServiceDialog(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="service-dialog-main-wrapper">
        <h2>{__('General')}</h2>
        {/* Dialog General Info */}
        <div className="service-dialog-info">
          <TextInput
            id="dialogName"
            className="dialog-name"
            labelText={__('Dialog\'s name')}
            value={data.label}
            title={__('Search by Name within results')}
            onChange={(event) => setData({
              ...data,
              label: event.target.value,
            })}
          />
          <TextArea
            id="dialogDescription"
            className="dialog-description"
            labelText={__('Dialog\'s description')}
            value={data.description}
            onChange={(event) => setData({
              ...data,
              description: event.target.value,
            })}
          />
        </div>
        {/* Component chooser and Drag and Drop section */}
        <div className="drag-and-drop-wrapper">
          <DynamicComponentChooser
            list={data.list}
            onDragStartComponent={(event, type) => onDragStartComponent(event, type)}
          />
          {
            renderTabContents()
          }
        </div>
        {/* Form submit/cancel buttons */}
        <div className="custom-button-wrapper">
          <Button
            disabled={!isSubmitButtonEnabled}
            kind="primary"
            className="btnRight"
            type="submit"
            variant="contained"
          >
            { __('Submit')}
          </Button>
          <Button variant="contained" type="button" onClick={() => console.log('this is on cancel')} kind="secondary">
            { __('Cancel')}
          </Button>
        </div>
        {showTabEditModal && selTab && (
          <EditTabModal
            tabName={selTab.name}
            showModal={showTabEditModal}
            onSave={(e, editedValues) => {
              console.log("onSave triggered", editedValues);
              setShowTabEditModal(false);
              setSelTab(null);
            }}
            onModalHide={() => {
              setShowTabEditModal(false);
              setSelTab(null);
            }}
          />
        )}
      </div>
    </form>
  );
};

export default ServiceDialogForm;
