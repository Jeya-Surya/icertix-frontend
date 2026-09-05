import React, { useState, useEffect, useCallback } from 'react';
import { 
  StudioDesignSchema, 
  StudioElement, 
  PageSize, 
  PageOrientation, 
  DynamicFieldKey 
} from '../../../types/templateStudio';
import { Organisation } from '../../../types';
import { EditorTopBar } from './EditorTopBar';
import { EditorSidebar } from './EditorSidebar';
import { CanvasStage } from './CanvasStage';
import { PropertiesPanel } from './PropertiesPanel';
import { TestCertificateModal } from '../modals/TestCertificateModal';
import { PublishVersionModal } from '../modals/PublishVersionModal';
import { DEFAULT_DEMO_DATA, PAGE_SIZES } from '../../../utils/templatePresets';

interface CanvaEditorProps {
  initialSchema: StudioDesignSchema;
  currentOrg: Organisation;
  onBackToLibrary: () => void;
  onSaveSchema: (schema: StudioDesignSchema) => void;
}

// Helper to ensure exactly one seal and one QR code exist on all certificate schemas
const ensureMandatoryElements = (baseSchema: StudioDesignSchema): StudioDesignSchema => {
  let elements = [...(baseSchema.elements || [])];

  // Exactly ONE seal element
  const sealElements = elements.filter(el => el.type === 'seal');
  if (sealElements.length === 0) {
    elements.push({
      id: 'el-icertix-seal',
      name: 'iCertiX Sovereign Seal',
      type: 'seal',
      sealType: 'minimal-icertix',
      x: (baseSchema.page?.width || 1000) - 180,
      y: (baseSchema.page?.height || 707) - 180,
      width: 100,
      height: 100,
      zIndex: elements.length + 1
    });
  } else if (sealElements.length > 1) {
    // Keep only the first seal element and deduplicate
    const firstSealId = sealElements[0].id;
    elements = elements.filter(el => el.type !== 'seal' || el.id === firstSealId);
  }

  // Exactly ONE dynamic QR element
  const qrElements = elements.filter(el => el.type === 'qr');
  if (qrElements.length === 0) {
    elements.push({
      id: 'el-verification-qr',
      name: 'Dynamic Verification QR',
      type: 'qr',
      x: 60,
      y: (baseSchema.page?.height || 707) - 160,
      width: 85,
      height: 85,
      zIndex: elements.length + 1
    });
  } else if (qrElements.length > 1) {
    // Keep only the first QR element and deduplicate
    const firstQrId = qrElements[0].id;
    elements = elements.filter(el => el.type !== 'qr' || el.id === firstQrId);
  }

  return {
    ...baseSchema,
    elements
  };
};

export const CanvaEditor: React.FC<CanvaEditorProps> = ({
  initialSchema,
  currentOrg,
  onBackToLibrary,
  onSaveSchema
}) => {
  const [schema, setSchema] = useState<StudioDesignSchema>(() => ensureMandatoryElements(initialSchema));
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // History State for Undo / Redo
  const [history, setHistory] = useState<StudioDesignSchema[]>([schema]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Canvas View Controls - Dynamically scaled for device size and orientation
  const [zoom, setZoom] = useState(() => {
    const isPortrait = initialSchema.page?.orientation === 'portrait';
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      if (w < 640) return isPortrait ? 0.32 : 0.35;
      if (w < 1024) return isPortrait ? 0.45 : 0.52;
    }
    return isPortrait ? 0.58 : 0.70;
  });
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [previewMode, setPreviewMode] = useState(true); // true = demo data, false = tokens

  // Sidebar and Panel Collapse Controls (Collapsed by default on mobile/tablet)
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(true);

  // Automatically expand right properties panel whenever an element is clicked / selected
  useEffect(() => {
    if (selectedElementId) {
      setIsRightPanelCollapsed(false);
    }
  }, [selectedElementId]);

  // Adjust zoom on window resize if viewport crosses breakpoints
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setIsLeftSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modals
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const selectedElement = schema.elements.find(el => el.id === selectedElementId) || null;

  // Push new state to history stack
  const pushHistory = useCallback((newSchema: StudioDesignSchema) => {
    setHistory(prev => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newSchema];
    });
    setHistoryIndex(prev => prev + 1);
    setHasUnsavedChanges(true);
  }, [historyIndex]);

  // Undo / Redo Handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      setSchema(history[targetIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      setSchema(history[targetIndex]);
    }
  };

  // Keyboard shortcut listener for Ctrl+Z, Ctrl+Y, Ctrl+S, Delete, Ctrl+D
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveDraft();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          handleDeleteElement(selectedElementId);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (selectedElement) {
          e.preventDefault();
          handleDuplicateElement(selectedElement);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedElementId, selectedElement, schema, historyIndex, history]);

  // Update an element in schema
  const handleUpdateElement = (updatedElement: StudioElement) => {
    const updatedElements = schema.elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    );
    const newSchema = { ...schema, elements: updatedElements };
    setSchema(newSchema);
    pushHistory(newSchema);
  };

  // Add a new element to schema
  const handleAddElement = (newElement: StudioElement) => {
    const newSchema = {
      ...schema,
      elements: [...schema.elements, newElement]
    };
    setSchema(newSchema);
    setSelectedElementId(newElement.id);
    pushHistory(newSchema);
  };

  // Delete an element (Mandatory iCertiX seal and Dynamic QR cannot be deleted)
  const handleDeleteElement = (id: string) => {
    const targetEl = schema.elements.find(el => el.id === id);
    if (targetEl?.type === 'seal' || targetEl?.type === 'qr') {
      // Both iCertiX Seal badge and Dynamic Verification QR are mandatory and cannot be removed
      return;
    }
    const newSchema = {
      ...schema,
      elements: schema.elements.filter(el => el.id !== id)
    };
    setSchema(newSchema);
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    pushHistory(newSchema);
  };

  // Duplicate an element
  const handleDuplicateElement = (element: StudioElement) => {
    if (element.type === 'seal' || element.type === 'qr') {
      // Cannot duplicate mandatory singleton elements
      return;
    }
    const duplicated: StudioElement = {
      ...element,
      id: `el-${element.type}-${Date.now().toString().slice(-4)}`,
      name: `${element.name} (Copy)`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: schema.elements.length + 1
    };
    handleAddElement(duplicated);
  };

  // Reorder elements
  const handleReorderElements = (newElements: StudioElement[]) => {
    const newSchema = { ...schema, elements: newElements };
    setSchema(newSchema);
    pushHistory(newSchema);
  };

  // Update background
  const handleUpdateBackground = (bg: any) => {
    const newSchema = { ...schema, background: bg };
    setSchema(newSchema);
    pushHistory(newSchema);
  };

  // Update page dimensions / orientation with intelligent layout reflow
  const handleUpdatePageSize = (size: PageSize, orientation: PageOrientation) => {
    let newWidth = 1000;
    let newHeight = 707;

    if (size === 'A4') {
      newWidth = orientation === 'landscape' ? 1000 : 707;
      newHeight = orientation === 'landscape' ? 707 : 1000;
    } else if (size === 'Letter') {
      newWidth = orientation === 'landscape' ? 1056 : 816;
      newHeight = orientation === 'landscape' ? 816 : 1056;
    }

    const oldWidth = schema.page?.width || (schema.page?.orientation === 'landscape' ? 1000 : 707);
    const oldHeight = schema.page?.height || (schema.page?.orientation === 'landscape' ? 707 : 1000);

    if (oldWidth === newWidth && oldHeight === newHeight && schema.page?.size === size && schema.page?.orientation === orientation) {
      return;
    }

    const scaleX = newWidth / oldWidth;
    const scaleY = newHeight / oldHeight;

    const adaptedElements: StudioElement[] = schema.elements.map((el) => {
      // 1. Full-page borders & outer frames
      const isBorderOrFrame =
        el.shapeType === 'frame-border' ||
        (el.shapeType === 'rectangle' && (!el.fill || el.fill === 'transparent' || el.fill === 'none') && (el.strokeWidth || 0) > 0 && el.width >= oldWidth - 140 && el.height >= oldHeight - 140) ||
        el.name.toLowerCase().includes('border') ||
        el.name.toLowerCase().includes('frame');

      if (isBorderOrFrame) {
        const marginX = Math.min(Math.max(el.x, 15), 50);
        const marginY = Math.min(Math.max(el.y, 15), 50);
        const newMarginX = Math.round(marginX * (newWidth < oldWidth ? 0.85 : 1.15));
        const newMarginY = Math.round(marginY * (newHeight < oldHeight ? 0.85 : 1.15));
        return {
          ...el,
          x: newMarginX,
          y: newMarginY,
          width: Math.max(100, newWidth - 2 * newMarginX),
          height: Math.max(100, newHeight - 2 * newMarginY)
        };
      }

      // 2. Horizontal divider lines & accent bar shapes
      const isHorizontalLine =
        el.type === 'line' ||
        (el.type === 'shape' && el.height <= 25 && el.width >= oldWidth * 0.4);

      if (isHorizontalLine) {
        const wasCentered = Math.abs((el.x + el.width / 2) - (oldWidth / 2)) < 40;
        const newW = Math.min(newWidth - 40, Math.max(80, Math.round(el.width * scaleX)));
        const newX = wasCentered ? Math.round((newWidth - newW) / 2) : Math.max(10, Math.min(newWidth - newW - 10, Math.round(el.x * scaleX)));
        const newY = Math.max(10, Math.min(newHeight - el.height - 10, Math.round(el.y * scaleY)));
        return {
          ...el,
          x: newX,
          y: newY,
          width: newW,
          height: el.height
        };
      }

      // 3. Text and Dynamic Variable Fields (titles, names, descriptions, metadata)
      const isTextOrDynamic = el.type === 'text' || el.type === 'dynamic-field';
      if (isTextOrDynamic) {
        const wasCentered = Math.abs((el.x + el.width / 2) - (oldWidth / 2)) < 50 || el.textAlign === 'center';
        const newW = Math.min(newWidth - 30, Math.max(100, Math.round(el.width * scaleX)));
        const newX = wasCentered ? Math.round((newWidth - newW) / 2) : Math.max(10, Math.min(newWidth - newW - 10, Math.round(el.x * scaleX)));
        const newY = Math.max(10, Math.min(newHeight - el.height - 10, Math.round(el.y * scaleY)));
        return {
          ...el,
          x: newX,
          y: newY,
          width: newW,
          height: el.height
        };
      }

      // 4. Fixed aspect & special elements (seals, QR code, signatures, images, shapes)
      let newW = el.width;
      let newH = el.height;
      const isFixedAspect = el.type === 'seal' || el.type === 'qr' || el.type === 'signature' || el.type === 'image';

      if (!isFixedAspect) {
        newW = Math.min(newWidth - 20, Math.max(15, Math.round(el.width * scaleX)));
        newH = Math.min(newHeight - 20, Math.max(15, Math.round(el.height * scaleY)));
      } else {
        if (newW > newWidth * 0.35) {
          const ratio = (newWidth * 0.35) / newW;
          newW = Math.round(newW * ratio);
          newH = Math.round(newH * ratio);
        }
      }

      // Centered seals / icons
      const wasCentered = Math.abs((el.x + el.width / 2) - (oldWidth / 2)) < 30;
      const newX = wasCentered
        ? Math.round((newWidth - newW) / 2)
        : Math.max(10, Math.min(newWidth - newW - 10, Math.round(el.x * scaleX)));
      const newY = Math.max(10, Math.min(newHeight - newH - 10, Math.round(el.y * scaleY)));

      return {
        ...el,
        x: newX,
        y: newY,
        width: newW,
        height: newH
      };
    });

    const newSchema = {
      ...schema,
      page: {
        ...schema.page,
        size,
        orientation,
        width: newWidth,
        height: newHeight
      },
      elements: adaptedElements
    };

    setSchema(newSchema);
    pushHistory(newSchema);

    // Auto-fit zoom for new orientation
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    if (orientation === 'portrait') {
      setZoom(w < 640 ? 0.32 : w < 1024 ? 0.45 : 0.58);
    } else {
      setZoom(w < 640 ? 0.35 : w < 1024 ? 0.52 : 0.70);
    }
  };

  // Apply prebuilt template preset
  const handleApplyTemplatePreset = (presetSchema: StudioDesignSchema) => {
    const mergedSchema: StudioDesignSchema = ensureMandatoryElements({
      ...presetSchema,
      id: schema.id,
      templateId: schema.templateId,
      name: schema.name,
      version: schema.version,
      status: schema.status,
      organisationId: schema.organisationId
    });
    setSchema(mergedSchema);
    setSelectedElementId(null);
    pushHistory(mergedSchema);
  };

  // Handle Drag & Drop from Sidebar into Canvas
  const handleDropElement = (type: string, data: any, canvasX: number, canvasY: number) => {
    if (type === 'dynamic-field') {
      const field = data;
      const newEl: StudioElement = {
        id: `el-${field.key}-${Date.now().toString().slice(-4)}`,
        name: field.label,
        type: 'dynamic-field',
        fieldKey: field.key,
        fallbackText: field.label,
        x: Math.max(20, Math.min(schema.page.width - 220, canvasX - 100)),
        y: Math.max(20, Math.min(schema.page.height - 40, canvasY - 15)),
        width: 220,
        height: (field.defaultSize || 16) + 20,
        fontFamily: field.defaultFont || 'Plus Jakarta Sans',
        fontSize: field.defaultSize || 16,
        fontWeight: '600',
        color: field.defaultColor || '#0A2540',
        textAlign: 'center',
        zIndex: schema.elements.length + 1
      };
      handleAddElement(newEl);
    } else if (type === 'text-preset') {
      const presets = {
        heading: {
          name: 'Certificate Heading',
          text: 'CERTIFICATE OF ACHIEVEMENT',
          fontSize: 28,
          fontFamily: 'Cinzel',
          fontWeight: 'bold',
          color: '#0A2540',
          width: 550,
          height: 48
        },
        subheading: {
          name: 'Subheading Text',
          text: 'This is to officially certify that',
          fontSize: 16,
          fontFamily: 'Playfair Display',
          fontStyle: 'italic' as const,
          color: '#475569',
          width: 420,
          height: 36
        },
        body: {
          name: 'Body Paragraph Text',
          text: 'has successfully completed all prescribed program requirements with academic distinction.',
          fontSize: 14,
          fontFamily: 'Plus Jakarta Sans',
          color: '#334155',
          width: 550,
          height: 48
        },
        calligraphy: {
          name: 'Signatory Calligraphy',
          text: 'Prof. Arthur Pendelton',
          fontSize: 26,
          fontFamily: 'Alex Brush',
          color: '#0A2540',
          width: 280,
          height: 45
        }
      };
      const presetData = presets[data.preset as keyof typeof presets] || presets.heading;
      const newEl: StudioElement = {
        id: `el-text-${Date.now().toString().slice(-4)}`,
        type: 'text',
        x: Math.max(20, Math.min(schema.page.width - presetData.width, canvasX - presetData.width / 2)),
        y: Math.max(20, Math.min(schema.page.height - presetData.height, canvasY - presetData.height / 2)),
        textAlign: 'center',
        zIndex: schema.elements.length + 1,
        ...presetData
      };
      handleAddElement(newEl);
    } else if (type === 'seal') {
      const newEl: StudioElement = {
        id: `el-seal-${Date.now().toString().slice(-4)}`,
        name: `Seal (${data.sealType})`,
        type: 'seal',
        sealType: data.sealType,
        x: Math.max(20, Math.min(schema.page.width - 90, canvasX - 45)),
        y: Math.max(20, Math.min(schema.page.height - 90, canvasY - 45)),
        width: 90,
        height: 90,
        zIndex: schema.elements.length + 1
      };
      handleAddElement(newEl);
    } else if (type === 'signature') {
      const newEl: StudioElement = {
        id: `el-sig-${Date.now().toString().slice(-4)}`,
        name: 'Signatory Line',
        type: 'signature',
        signatureType: 'calligraphy',
        signatoryIndex: 0,
        x: Math.max(20, Math.min(schema.page.width - 220, canvasX - 110)),
        y: Math.max(20, Math.min(schema.page.height - 70, canvasY - 35)),
        width: 220,
        height: 70,
        zIndex: schema.elements.length + 1
      };
      handleAddElement(newEl);
    } else if (type === 'qr') {
      const newEl: StudioElement = {
        id: `el-qr-${Date.now().toString().slice(-4)}`,
        name: 'Dynamic QR',
        type: 'qr',
        x: Math.max(20, Math.min(schema.page.width - 80, canvasX - 40)),
        y: Math.max(20, Math.min(schema.page.height - 80, canvasY - 40)),
        width: 80,
        height: 80,
        zIndex: schema.elements.length + 1
      };
      handleAddElement(newEl);
    } else if (type === 'shape') {
      let width = 200;
      let height = 100;
      let strokeWidth = 2;
      let fill = '#F8FAFC';
      let stroke = '#0A2540';

      if (data.shapeType === 'frame-border') {
        width = schema.page.width - 60;
        height = schema.page.height - 60;
        fill = 'transparent';
        strokeWidth = 3;
      } else if (data.shapeType === 'line') {
        width = 300;
        height = 2;
        fill = stroke;
        strokeWidth = 0;
      } else if (data.shapeType === 'circle') {
        width = 90;
        height = 90;
      }

      const newEl: StudioElement = {
        id: `el-shape-${Date.now().toString().slice(-4)}`,
        name: data.shapeType === 'frame-border' ? 'Certificate Border Frame' : data.shapeType,
        type: data.shapeType === 'line' ? 'line' : data.shapeType === 'frame-border' ? 'frame' : 'shape',
        shapeType: data.shapeType,
        x: data.shapeType === 'frame-border' ? 30 : Math.max(20, Math.min(schema.page.width - width, canvasX - width / 2)),
        y: data.shapeType === 'frame-border' ? 30 : Math.max(20, Math.min(schema.page.height - height, canvasY - height / 2)),
        width,
        height,
        fill,
        stroke,
        strokeWidth,
        zIndex: data.shapeType === 'frame-border' ? 1 : schema.elements.length + 1
      };
      handleAddElement(newEl);
    }
  };

  // Save draft to store
  const handleSaveDraft = () => {
    onSaveSchema(schema);
    setHasUnsavedChanges(false);
  };

  // Publish new version
  const handleConfirmPublish = (versionIncrement: boolean, changelog: string) => {
    const publishedSchema: StudioDesignSchema = {
      ...schema,
      version: versionIncrement ? schema.version + 1 : schema.version,
      status: 'PUBLISHED'
    };
    setSchema(publishedSchema);
    onSaveSchema(publishedSchema);
    setHasUnsavedChanges(false);
  };

  const handleFitZoom = () => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isLandscape = schema.page.orientation === 'landscape';
    if (w < 640) {
      setZoom(isLandscape ? 0.35 : 0.32);
    } else if (w < 1024) {
      setZoom(isLandscape ? 0.52 : 0.45);
    } else {
      setZoom(isLandscape ? 0.70 : 0.58);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] lg:h-[calc(100vh-115px)] bg-slate-900 overflow-hidden border border-slate-700 shadow-2xl rounded-xl sm:rounded-2xl animate-fadeIn">
      {/* 1. TOP STUDIO BAR */}
      <EditorTopBar
        schema={schema}
        onUpdateSchemaName={(name) => {
          setSchema(prev => ({ ...prev, name }));
          setHasUnsavedChanges(true);
        }}
        onBackToLibrary={onBackToLibrary}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        previewMode={previewMode}
        onTogglePreviewMode={() => setPreviewMode(!previewMode)}
        onSaveDraft={handleSaveDraft}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* 2. MAIN 3-COLUMN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Tools & Elements Drawer */}
        <EditorSidebar
          schema={schema}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onAddElement={handleAddElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onReorderElements={handleReorderElements}
          onUpdateBackground={handleUpdateBackground}
          onApplyTemplatePreset={handleApplyTemplatePreset}
          isCollapsed={isLeftSidebarCollapsed}
          onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        />

        {/* Center Workspace (Interactive Canvas Stage) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-200">
          {/* Canvas Stage */}
          <CanvasStage
            schema={schema}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            zoom={zoom}
            onZoomChange={setZoom}
            onFitZoom={handleFitZoom}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            snapToGrid={snapToGrid}
            onToggleSnap={() => setSnapToGrid(!snapToGrid)}
            previewMode={previewMode}
            onTogglePreviewMode={() => setPreviewMode(!previewMode)}
            demoData={DEFAULT_DEMO_DATA}
            onDropElement={handleDropElement}
          />
        </div>

        {/* Right Inspector & Properties Panel */}
        <PropertiesPanel
          schema={schema}
          selectedElementId={selectedElementId}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onUpdatePageSize={handleUpdatePageSize}
          onUpdateBackground={handleUpdateBackground}
          isCollapsed={isRightPanelCollapsed}
          onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        />
      </div>

      {/* 3. SIMULATION & VERSIONING MODALS */}
      <TestCertificateModal
        schema={schema}
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

      <PublishVersionModal
        schema={schema}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirmPublish={handleConfirmPublish}
      />
    </div>
  );
};
