import { useState, useEffect } from 'react'
import { sourceCodeApi, categoryApi, type SourceCode, type Category } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { SourceCodeFormData, SourceCodeState, DEFAULT_FORM_DATA } from '@/types/source-code'

export const useSourceCodeData = () => {
  const { user } = useAuth()
  const [state, setState] = useState<SourceCodeState>({
    sourceCodes: [],
    categories: [],
    loading: true,
    error: null,
    searchQuery: "",
    selectedCategory: "Tất cả",
    currentPage: 1,
    totalCount: 0,
    isCreateDialogOpen: false,
    isEditDialogOpen: false,
    editingSourceCode: null,
    isSubmitting: false,
    formData: DEFAULT_FORM_DATA,
  })

  const itemsPerPage = 10

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getActive()
      if (response.success && response.data) {
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : response.data.data || []
        setState(prev => ({ ...prev, categories: categoriesData }))
      }
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err)
    }
  }

  // Fetch source codes
  const fetchSourceCodes = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const response = await sourceCodeApi.getAll(
        state.currentPage,
        itemsPerPage,
        state.searchQuery || undefined,
        state.selectedCategory !== "Tất cả" ? state.selectedCategory : undefined
      )
      
      if (response.success && response.data) {
        let sourceCodesData: SourceCode[] = []
        let totalData = 0
        
        if (Array.isArray(response.data)) {
          sourceCodesData = response.data
          totalData = response.data.length
        } else if (response.data.data) {
          sourceCodesData = response.data.data
          totalData = response.data.count || response.data.total || 0
        } else if (response.data.items) {
          sourceCodesData = response.data.items
          totalData = response.data.count || response.data.total || 0
        }
        
        setState(prev => ({
          ...prev,
          sourceCodes: sourceCodesData,
          totalCount: totalData,
          error: null
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || "Không thể tải danh sách source code"
        }))
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setState(prev => ({ ...prev, error: "Lỗi kết nối đến server" }))
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  // Reset form
  const resetForm = () => {
    setState(prev => ({
      ...prev,
      formData: DEFAULT_FORM_DATA,
      editingSourceCode: null
    }))
  }

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = state.categories.find(cat => cat._id === categoryId)
    return category ? category.name : categoryId
  }

  // Handle create source code
  const handleCreateSourceCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Bạn cần đăng nhập để tạo source code")
      return
    }
    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', state.formData.name)
      state.formData.category.forEach(cat => {
        formDataToSend.append('category', cat)
      })
      formDataToSend.append('price', state.formData.price.toString())
      formDataToSend.append('discountPercent', (state.formData.discountPercent || 0).toString())
      formDataToSend.append('description', state.formData.description.join(','))
      formDataToSend.append('policy', state.formData.policy.join(','))
      formDataToSend.append('tags', state.formData.tags.join(','))
      formDataToSend.append('isActive', state.formData.isActive.toString())
      formDataToSend.append('createdBy', user._id)
      
      if (state.formData.thumbnail) {
        formDataToSend.append('thumbnailImage', state.formData.thumbnail)
      }
      
      if (state.formData.imagePreview && state.formData.imagePreview.length > 0) {
        state.formData.imagePreview.forEach(file => {
          formDataToSend.append('imagePreview', file)
        })
      }
      
      if (state.formData.videoPreview && state.formData.videoPreview.length > 0) {
        state.formData.videoPreview.forEach(file => {
          formDataToSend.append('videoPreview', file)
        })
      }
      
      if (state.formData.videoTutorial && state.formData.videoTutorial.length > 0) {
        state.formData.videoTutorial.forEach(file => {
          formDataToSend.append('videoTutorial', file)
        })
      }
      
      if (state.formData.sourceCodeFile) {
        formDataToSend.append('sourceCodeFile', state.formData.sourceCodeFile)
      }

      const response = await sourceCodeApi.create(formDataToSend)
      if (response.success) {
        toast.success("Tạo source code thành công!")
        setState(prev => ({ ...prev, isCreateDialogOpen: false }))
        resetForm()
        fetchSourceCodes()
      } else {
        toast.error(response.message || "Không thể tạo source code")
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến server")
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  // Handle edit source code
  const handleEditSourceCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.editingSourceCode) return
    
    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', state.formData.name)
      state.formData.category.forEach(cat => {
        formDataToSend.append('category', cat)
      })
      formDataToSend.append('price', state.formData.price.toString())
      formDataToSend.append('discountPercent', (state.formData.discountPercent || 0).toString())
      formDataToSend.append('description', state.formData.description.join(','))
      formDataToSend.append('policy', state.formData.policy.join(','))
      formDataToSend.append('tags', state.formData.tags.join(','))
      formDataToSend.append('isActive', state.formData.isActive.toString())
      // Ensure backend knows who updates (some APIs require this)
      if (user?._id) {
        formDataToSend.append('createdBy', user._id)
      }
      
      if (state.formData.thumbnail) {
        formDataToSend.append('thumbnailImage', state.formData.thumbnail)
      }
      
      if (state.formData.imagePreview && state.formData.imagePreview.length > 0) {
        state.formData.imagePreview.forEach(file => {
          formDataToSend.append('imagePreview', file)
        })
      }
      
      if (state.formData.videoPreview && state.formData.videoPreview.length > 0) {
        state.formData.videoPreview.forEach(file => {
          formDataToSend.append('videoPreview', file)
        })
      }
      
      if (state.formData.videoTutorial && state.formData.videoTutorial.length > 0) {
        state.formData.videoTutorial.forEach(file => {
          formDataToSend.append('videoTutorial', file)
        })
      }
      
      if (state.formData.sourceCodeFile) {
        formDataToSend.append('sourceCodeFile', state.formData.sourceCodeFile)
      }

      const response = await sourceCodeApi.update(state.editingSourceCode._id, formDataToSend)
      if (response.success) {
        toast.success("Cập nhật source code thành công!")
        setState(prev => ({ ...prev, isEditDialogOpen: false }))
        resetForm()
        fetchSourceCodes()
      } else {
        toast.error(response.message || "Không thể cập nhật source code")
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến server")
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  // Handle delete source code
  const handleDeleteSourceCode = async (id: string) => {
    try {
      const response = await sourceCodeApi.delete(id)
      if (response.success) {
        toast.success("Xóa source code thành công!")
        fetchSourceCodes()
      } else {
        toast.error(response.message || "Không thể xóa source code")
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến server")
    }
  }

  // Open edit dialog
  const openEditDialog = (sourceCode: SourceCode) => {
    setState(prev => ({
      ...prev,
      editingSourceCode: sourceCode,
      formData: {
        name: sourceCode.name,
        // Ensure categories become string IDs even if backend returns objects
        category: Array.isArray(sourceCode.category)
          ? (sourceCode.category as any[]).map((cat: any) => typeof cat === 'string' ? cat : cat?._id)
          : [],
        price: sourceCode.price,
        discountPercent: sourceCode.discountPercent || 0,
        description: sourceCode.description || [""],
        policy: sourceCode.policy || [""],
        tags: sourceCode.tags || [],
        isActive: sourceCode.isActive ?? true,
      },
      isEditDialogOpen: true
    }))
  }

  // Handle file input change
  const handleFileChange = (field: keyof SourceCodeFormData, files: FileList | null) => {
    if (!files) return
    
    if (field === 'thumbnail' || field === 'sourceCodeFile') {
      setState(prev => ({
        ...prev,
        formData: { ...prev.formData, [field]: files[0] }
      }))
    } else if (field === 'imagePreview' || field === 'videoPreview' || field === 'videoTutorial') {
      setState(prev => ({
        ...prev,
        formData: { ...prev.formData, [field]: Array.from(files) }
      }))
    }
  }

  const handleArrayFieldChange = (field: 'description' | 'policy', index: number, value: string) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: prev.formData[field].map((item, i) => i === index ? value : item)
      }
    }))
  }

  const addArrayField = (field: 'description' | 'policy') => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: [...prev.formData[field], ""] }
    }))
  }

  const removeArrayField = (field: 'description' | 'policy', index: number) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: prev.formData[field].filter((_, i) => i !== index)
      }
    }))
  }

  // Handle tags
  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, tags }
    }))
  }

  // Filter source codes
  const filteredSourceCodes = state.sourceCodes?.filter(sourceCode => {
    const matchesSearch = sourceCode.name.toLowerCase().includes(state.searchQuery.toLowerCase())

    const matchesCategory = (() => {
      if (state.selectedCategory === "Tất cả") return true
      const cat = sourceCode.category as any
      if (!cat) return false
      if (Array.isArray(cat)) {
        if (cat.length === 0) return false
        if (typeof cat[0] === 'string') {
          return (cat as string[]).includes(state.selectedCategory)
        }
        // assume object array with _id
        return (cat as any[]).some((c: any) => (c?._id || c?.id) === state.selectedCategory)
      }
      if (typeof cat === 'string') return cat === state.selectedCategory
      return (cat?._id || cat?.id) === state.selectedCategory
    })()

    return matchesSearch && matchesCategory
  }) || []

  useEffect(() => {
    fetchCategories()
    fetchSourceCodes()
  }, [state.currentPage])

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    ...state,
    filteredSourceCodes,
    itemsPerPage,
    // Actions
    setSourceCodes: (sourceCodes: SourceCode[]) => setState(prev => ({ ...prev, sourceCodes })),
    setCategories: (categories: Category[]) => setState(prev => ({ ...prev, categories })),
    setLoading: (loading: boolean) => setState(prev => ({ ...prev, loading })),
    setError: (error: string | null) => setState(prev => ({ ...prev, error })),
    setSearchQuery: (searchQuery: string) => setState(prev => ({ ...prev, searchQuery })),
    setSelectedCategory: (selectedCategory: string) => setState(prev => ({ ...prev, selectedCategory })),
    setCurrentPage: (currentPage: number) => setState(prev => ({ ...prev, currentPage })),
    setTotalCount: (totalCount: number) => setState(prev => ({ ...prev, totalCount })),
    setIsCreateDialogOpen: (isCreateDialogOpen: boolean) => setState(prev => ({ ...prev, isCreateDialogOpen })),
    setIsEditDialogOpen: (isEditDialogOpen: boolean) => setState(prev => ({ ...prev, isEditDialogOpen })),
    setEditingSourceCode: (editingSourceCode: SourceCode | null) => setState(prev => ({ ...prev, editingSourceCode })),
    setIsSubmitting: (isSubmitting: boolean) => setState(prev => ({ ...prev, isSubmitting })),
    setFormData: (formData: SourceCodeFormData | ((prev: SourceCodeFormData) => SourceCodeFormData)) => {
      setState(prev => ({
        ...prev,
        formData: typeof formData === 'function' ? formData(prev.formData) : formData
      }))
    },
    // Methods
    resetForm,
    fetchCategories,
    fetchSourceCodes,
    handleCreateSourceCode,
    handleEditSourceCode,
    handleDeleteSourceCode,
    openEditDialog,
    handleFileChange,
    handleArrayFieldChange,
    addArrayField,
    removeArrayField,
    handleTagsChange,
    getCategoryName,
  }
}