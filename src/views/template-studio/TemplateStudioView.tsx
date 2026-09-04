import React, { useState, useEffect } from 'react';
import { Organisation, CertificateTemplate, AuthUser } from '../../types';
import { StudioDesignSchema } from '../../types/templateStudio';
import { TemplateLibraryView } from './TemplateLibraryView';
import { CanvaEditor } from './components/CanvaEditor';
import { StudioPreviewModal } from './modals/StudioPreviewModal';
import { 
  PREBUILT_TEMPLATES_CATALOG, 
  legacyTemplateToDesignSchema, 
  designSchemaToLegacyTemplate,
  createBlankDesignSchema
} from '../../utils/templatePresets';

interface TemplateStudioViewProps {
  currentOrg: Organisation;
  templates: CertificateTemplate[];
  currentUser?: AuthUser | null;
  onSaveTemplate: (template: CertificateTemplate) => void;
  onUseTemplateForIssuance?: (templateId: string) => void;
  editingTemplateId?: string | null;
  isCreatingNew?: boolean;
  onClearEditingTemplate?: () => void;
}

const getOrgStorageKey = (orgId: string) => `icertix_studio_schemas_${orgId}`;

export const TemplateStudioView: React.FC<TemplateStudioViewProps> = ({
  currentOrg,
  templates,
  currentUser,
  onSaveTemplate,
  onUseTemplateForIssuance,
  editingTemplateId,
  isCreatingNew,
  onClearEditingTemplate
}) => {
  const [viewMode, setViewMode] = useState<'library' | 'editor'>('library');
  const [activeSchema, setActiveSchema] = useState<StudioDesignSchema | null>(null);
  const [previewModalSchema, setPreviewModalSchema] = useState<StudioDesignSchema | null>(null);

  // Load saved schemas from localStorage strictly scoped to current organization (Confidential & Isolated)
  const [savedSchemas, setSavedSchemas] = useState<StudioDesignSchema[]>(() => {
    try {
      const orgKey = getOrgStorageKey(currentOrg.id);
      const stored = localStorage.getItem(orgKey);
      if (stored) {
        const parsed: StudioDesignSchema[] = JSON.parse(stored);
        return parsed.filter(s => s.organisationId === currentOrg.id);
      }
    } catch {}
    return [];
  });

  // Re-sync when switching organizations
  useEffect(() => {
    try {
      const orgKey = getOrgStorageKey(currentOrg.id);
      const stored = localStorage.getItem(orgKey);
      if (stored) {
        const parsed: StudioDesignSchema[] = JSON.parse(stored);
        setSavedSchemas(parsed.filter(s => s.organisationId === currentOrg.id));
      } else {
        setSavedSchemas([]);
      }
    } catch {
      setSavedSchemas([]);
    }
  }, [currentOrg.id]);

  // Save schemas to localStorage strictly scoped to the active organization (Confidential)
  const persistSchema = (schema: StudioDesignSchema) => {
    const orgDisplayName = currentOrg.name;
    const enhancedSchema: StudioDesignSchema = {
      ...schema,
      organisationId: currentOrg.id,
      organisationName: orgDisplayName,
      customizedBy: orgDisplayName,
      publishedBy: orgDisplayName,
      meta: {
        ...schema.meta,
        author: orgDisplayName,
        publishedBy: orgDisplayName,
        organisationId: currentOrg.id,
        organisationName: orgDisplayName
      }
    };

    // 1. Update this org's private saved schemas (Strictly Private to currentOrg)
    setSavedSchemas(prev => {
      const existingIdx = prev.findIndex(s => s.id === enhancedSchema.id || s.templateId === enhancedSchema.templateId);
      let updated: StudioDesignSchema[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = enhancedSchema;
      } else {
        updated = [enhancedSchema, ...prev];
      }
      try {
        localStorage.setItem(getOrgStorageKey(currentOrg.id), JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Sync with parent App.tsx templates state for current tenant
    const legacyTpl = designSchemaToLegacyTemplate(enhancedSchema, currentOrg.id);
    onSaveTemplate(legacyTpl);
  };

  // Auto-launch editor when a specific template is selected for editing or creating
  useEffect(() => {
    if (editingTemplateId) {
      // 1. Check in savedSchemas
      const fromSaved = savedSchemas.find(s => s.id === editingTemplateId || s.templateId === editingTemplateId);
      if (fromSaved) {
        setActiveSchema(fromSaved);
        setViewMode('editor');
        return;
      }

      // 2. Check in PREBUILT catalog
      const fromPrebuilt = PREBUILT_TEMPLATES_CATALOG.find(p => p.id === editingTemplateId || p.name === editingTemplateId);
      if (fromPrebuilt) {
        setActiveSchema(fromPrebuilt.schema);
        setViewMode('editor');
        return;
      }

      // 3. Check in templates prop
      const fromTemplates = templates.find(t => t.id === editingTemplateId);
      if (fromTemplates) {
        const schema = fromTemplates.schema?.elements 
          ? (fromTemplates.schema as StudioDesignSchema) 
          : legacyTemplateToDesignSchema(fromTemplates, currentOrg);
        setActiveSchema(schema);
        setViewMode('editor');
        return;
      }
    } else if (isCreatingNew) {
      const blank = createBlankDesignSchema(currentOrg, 'A4', 'landscape', '#FFFFFF');
      setActiveSchema(blank);
      setViewMode('editor');
    }
  }, [editingTemplateId, isCreatingNew, templates, savedSchemas, currentOrg]);

  const handleOpenEditor = (schema: StudioDesignSchema) => {
    setActiveSchema(schema);
    setViewMode('editor');
  };

  const handleBackToLibrary = () => {
    setViewMode('library');
    setActiveSchema(null);
    onClearEditingTemplate?.();
  };

  const handleSaveSchema = (schema: StudioDesignSchema) => {
    persistSchema(schema);
    setActiveSchema(schema);
  };

  const handleDeleteSavedSchema = (schemaId: string) => {
    setSavedSchemas(prev => {
      const filtered = prev.filter(s => s.id !== schemaId);
      try {
        localStorage.setItem(getOrgStorageKey(currentOrg.id), JSON.stringify(filtered));
      } catch {}
      return filtered;
    });
  };

  return (
    <div className="space-y-6">
      {viewMode === 'library' ? (
        <TemplateLibraryView
          currentOrg={currentOrg}
          templates={templates}
          savedSchemas={savedSchemas}
          onOpenEditorWithSchema={handleOpenEditor}
          onOpenPreviewModal={(schema) => setPreviewModalSchema(schema)}
          onDeleteSavedSchema={handleDeleteSavedSchema}
          onUseForIssuance={onUseTemplateForIssuance}
        />
      ) : activeSchema ? (
        <CanvaEditor
          initialSchema={activeSchema}
          currentOrg={currentOrg}
          onBackToLibrary={handleBackToLibrary}
          onSaveSchema={handleSaveSchema}
        />
      ) : null}

      {/* Fullscreen Preview Modal */}
      {previewModalSchema && (
        <StudioPreviewModal
          schema={previewModalSchema}
          isOpen={Boolean(previewModalSchema)}
          onClose={() => setPreviewModalSchema(null)}
          onOpenInEditor={(schema) => {
            setPreviewModalSchema(null);
            handleOpenEditor(schema);
          }}
        />
      )}
    </div>
  );
};
