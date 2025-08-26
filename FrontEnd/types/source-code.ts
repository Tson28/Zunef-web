import { SourceCode, Category } from '@/lib/api'

export interface SourceCodeFormData {
  name: string
  category: string[]
  price: number
  discountPercent?: number
  description: string[]
  policy: string[]
  tags: string[]
  isActive: boolean
  thumbnail?: File
  imagePreview?: File[]
  videoPreview?: File[]
  videoTutorial?: File[]
  sourceCodeFile?: File
}

export interface SourceCodeState {
  sourceCodes: SourceCode[]
  categories: Category[]
  loading: boolean
  error: string | null
  searchQuery: string
  selectedCategory: string
  currentPage: number
  totalCount: number
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  editingSourceCode: SourceCode | null
  isSubmitting: boolean
  formData: SourceCodeFormData
}

export interface SourceCodeActions {
  setSourceCodes: (sourceCodes: SourceCode[]) => void
  setCategories: (categories: Category[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  setCurrentPage: (page: number) => void
  setTotalCount: (count: number) => void
  setIsCreateDialogOpen: (open: boolean) => void
  setIsEditDialogOpen: (open: boolean) => void
  setEditingSourceCode: (sourceCode: SourceCode | null) => void
  setIsSubmitting: (submitting: boolean) => void
  setFormData: (formData: SourceCodeFormData | ((prev: SourceCodeFormData) => SourceCodeFormData)) => void
  resetForm: () => void
  fetchCategories: () => Promise<void>
  fetchSourceCodes: () => Promise<void>
  handleCreateSourceCode: (e: React.FormEvent) => Promise<void>
  handleEditSourceCode: (e: React.FormEvent) => Promise<void>
  handleDeleteSourceCode: (id: string) => Promise<void>
  openEditDialog: (sourceCode: SourceCode) => void
}

export interface FileUploadProps {
  field: keyof SourceCodeFormData
  files: FileList | null
  formData: SourceCodeFormData
  setFormData: (formData: SourceCodeFormData | ((prev: SourceCodeFormData) => SourceCodeFormData)) => void
  editingSourceCode?: SourceCode | null
  isEdit?: boolean
}

export interface ArrayFieldProps {
  field: 'description' | 'policy'
  values: string[]
  onChange: (field: 'description' | 'policy', index: number, value: string) => void
  onAdd: (field: 'description' | 'policy') => void
  onRemove: (field: 'description' | 'policy', index: number) => void
}

export interface CategorySelectorProps {
  categories: Category[]
  selectedCategories: string[]
  onCategoryAdd: (categoryId: string) => void
  onCategoryRemove: (categoryId: string) => void
}

export interface SearchAndFilterProps {
  searchQuery: string
  selectedCategory: string
  categories: Category[]
  onSearchChange: (query: string) => void
  onCategoryChange: (category: string) => void
}

export interface SourceCodeTableProps {
  sourceCodes: SourceCode[]
  categories: Category[]
  loading: boolean
  onEdit: (sourceCode: SourceCode) => void
  onDelete: (id: string) => void
  getCategoryName: (categoryId: string) => string
}

export interface SourceCodeActionsProps {
  sourceCode: SourceCode
  onEdit: (sourceCode: SourceCode) => void
  onDelete: (id: string) => void
}

export const DEFAULT_FORM_DATA: SourceCodeFormData = {
  name: "",
  category: [],
  price: 0,
  discountPercent: 0,
  description: [""],
  policy: [""],
  tags: [],
  isActive: true,
}