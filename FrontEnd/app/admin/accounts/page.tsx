"use client"

import React, { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Search, Plus, Edit, Trash2, Eye, Loader2, Upload } from "lucide-react"
import { accountApi, fileApi, categoryApi, type Account, type Category } from "@/lib/api"
import { toast } from "sonner"
import { useSidebar } from "@/lib/sidebar-context"

interface AccountFormData {
  name: string
  category: string[]
  price: number
  Discount?: number
  stock?: number
  duration: '1_month' | '3_months' | '6_months' | '1_year'
  description: string[]
  policy: string[]
  thumbnail?: File
  imagepreview?: File[]
  videopreview?: File[]
}

export default function AdminAccountsPage() {
  const { isCollapsed } = useSidebar()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<AccountFormData>({
    name: "",
    category: [],
    price: 0,
    Discount: 0,
    stock: 0,
    duration: '1_month',
    description: [""],
    policy: [""],
  })

  const itemsPerPage = 10

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getActive()
      console.log("Categories response:", response)
      if (response.success && response.data) {
        // API trả về {data: [...]} chứ không phải {data: {data: [...]}}
        setCategories(response.data || [])
      }
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err)
    }
  }

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await accountApi.getAll(currentPage, itemsPerPage)
      console.log('API Response:', response) // Debug log
      if (response.success && response.data) {
        // Handle different response structures
        let accountsData = []
        let totalData = 0
        
        if (Array.isArray(response.data)) {
          // Direct array response
          accountsData = response.data
          totalData = response.count || response.data.length
        } else if (response.data.accounts) {
          // Nested in accounts property
          accountsData = response.data.accounts
          totalData = response.data.count || response.data.total || 0
        } else if (response.data.items) {
          // Nested in items property
          accountsData = response.data.items
          totalData = response.data.count || response.data.total || 0
        }
        
        setAccounts(accountsData)
        setTotalCount(totalData)
        console.log('Accounts set:', accountsData) // Debug log
      } else {
        setError(response.message || "Không thể tải danh sách tài khoản")
      }
    } catch (err) {
      console.error('Fetch error:', err) // Debug log
      setError("Lỗi kết nối đến server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchAccounts()
  }, [currentPage])

  useEffect(() => {
    fetchCategories()
  }, [])

  // Filter accounts
  const filteredAccounts = accounts?.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Tất cả" || account.category.includes(selectedCategory)
    return matchesSearch && matchesCategory
  }) || []

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      category: [],
      price: 0,
      Discount: 0,
      stock: 0,
      description: [""],
      policy: [""],
    })
    setEditingAccount(null)
  }

  // Handle create account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {

      // Create FormData for account
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('Discount', (formData.Discount || 0).toString())
      formDataToSend.append('stock', (formData.stock || 0).toString())
      formDataToSend.append('category', formData.category.join(','))
      formDataToSend.append('description', formData.description.join(','))
      formDataToSend.append('policy', formData.policy.join(','))
      
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail)
      }
      
      if (formData.imagepreview && formData.imagepreview.length > 0) {
        formData.imagepreview.forEach(file => {
          formDataToSend.append('imagepreview', file)
        })
      }
      
      if (formData.videopreview && formData.videopreview.length > 0) {
        formData.videopreview.forEach(file => {
          formDataToSend.append('videopreview', file)
        })
      }

      const response = await accountApi.create(formDataToSend)
      if (response.success) {
        toast.success("Tạo tài khoản thành công!")
        setIsCreateDialogOpen(false)
        resetForm()
        fetchAccounts()
      } else {
        toast.error(response.message || "Không thể tạo tài khoản")
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến server")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit account
  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAccount) return
    
    setIsSubmitting(true)

    try {

      // Create FormData for account update
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('Discount', (formData.Discount || 0).toString())
      formDataToSend.append('stock', (formData.stock || 0).toString())
      formDataToSend.append('category', formData.category.join(','))
      formDataToSend.append('description', formData.description.join(','))
      formDataToSend.append('policy', formData.policy.join(','))
      
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail)
      }
      
      if (formData.imagepreview && formData.imagepreview.length > 0) {
        formData.imagepreview.forEach(file => {
          formDataToSend.append('imagepreview', file)
        })
      }
      
      if (formData.videopreview && formData.videopreview.length > 0) {
        formData.videopreview.forEach(file => {
          formDataToSend.append('videopreview', file)
        })
      }

      const response = await accountApi.update(editingAccount._id, formDataToSend)
      if (response.success) {
        toast.success("Cập nhật tài khoản thành công!")
        setIsEditDialogOpen(false)
        resetForm()
        fetchAccounts()
      } else {
        toast.error(response.message || "Không thể cập nhật tài khoản")
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến server")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete account
  const handleDeleteAccount = async (id: string) => {
    try {
      const response = await accountApi.delete(id)
      if (response.success) {
        toast.success("Xóa tài khoản thành công!")
        fetchAccounts()
      } else {
        toast.error(response.message || "Không thể xóa tài khoản")
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến server")
    }
  }

  // Open edit dialog
  const openEditDialog = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      category: account.category,
      price: account.price,
      Discount: account.Discount,
      stock: account.stock,
      duration: account.duration || '1_month',
      description: account.description || [""],
      policy: account.policy || [""],
    })
    setIsEditDialogOpen(true)
  }

  // Handle file input change
  const handleFileChange = (field: keyof AccountFormData, files: FileList | null) => {
    if (!files) return
    
    if (field === 'thumbnail') {
      setFormData(prev => ({ ...prev, [field]: files[0] }))
    } else if (field === 'imagepreview' || field === 'videopreview') {
      setFormData(prev => ({ ...prev, [field]: Array.from(files) }))
    }
  }

  // Handle array field changes
  const handleArrayFieldChange = (field: 'description' | 'policy', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayField = (field: 'description' | 'policy') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }))
  }

  const removeArrayField = (field: 'description' | 'policy', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  // Simple AccountForm component
  const renderAccountForm = (isEdit = false) => {
    return (
      <form onSubmit={isEdit ? handleEditAccount : handleCreateAccount} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="account-name">Tên sản phẩm *</Label>
          <Input
            id="account-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Nhập tên sản phẩm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-category">Danh mục *</Label>
          <div className="border rounded-md p-3 space-y-2">
            <div className="text-sm text-muted-foreground mb-2">Chọn một hoặc nhiều danh mục:</div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {categories.map(cat => (
                <div key={cat._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${cat._id}`}
                    checked={formData.category.includes(cat.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          category: [...prev.category, cat.name] 
                        }))
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          category: prev.category.filter(c => c !== cat.name) 
                        }))
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`category-${cat._id}`} className="text-sm cursor-pointer">
                    {cat.name}
                  </label>
                </div>
              ))}
            </div>
            {formData.category.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-sm font-medium mb-1">Đã chọn:</div>
                <div className="flex flex-wrap gap-1">
                  {formData.category.map((catName, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {catName}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ 
                            ...prev, 
                            category: prev.category.filter(c => c !== catName) 
                          }))
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
             <Label htmlFor="account-price">Giá bán *</Label>
             <Input
               id="account-price"
               type="number"
               min="0"
               step="1000"
               value={formData.price || ""}
               onChange={(e) => {
                 const value = e.target.value
                 if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                   setFormData(prev => ({ ...prev, price: value === "" ? 0 : Number(value) }))
                 }
               }}
               required
               placeholder="Nhập giá bán"
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="account-discount">Giảm giá (%)</Label>
             <Input
               id="account-discount"
               type="number"
               min="0"
               max="100"
               step="1"
               value={formData.Discount || ""}
               onChange={(e) => {
                 const value = e.target.value
                 if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
                   setFormData(prev => ({ ...prev, Discount: value === "" ? undefined : Number(value) }))
                 }
               }}
               placeholder="Nhập % giảm giá"
             />
           </div>
        </div>

        <div className="space-y-2">
           <Label htmlFor="account-stock">Số lượng tồn kho</Label>
           <Input
             id="account-stock"
             type="number"
             min="0"
             step="1"
             value={formData.stock || ""}
             onChange={(e) => {
               const value = e.target.value
               if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                 setFormData(prev => ({ ...prev, stock: value === "" ? undefined : Number(value) }))
               }
             }}
             placeholder="Nhập số lượng"
           />
         </div>

        <div className="space-y-2">
           <Label htmlFor="account-duration">Gói thời gian</Label>
           <select
             id="account-duration"
             value={formData.duration}
             onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value as '1_month' | '3_months' | '6_months' | '1_year' }))}
             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             required
           >
             <option value="1_month">1 tháng</option>
             <option value="3_months">3 tháng</option>
             <option value="6_months">6 tháng</option>
             <option value="1_year">1 năm</option>
           </select>
         </div>

        <div className="space-y-2">
          <Label>Mô tả</Label>
          {formData.description.map((desc, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={desc}
                onChange={(e) => handleArrayFieldChange('description', index, e.target.value)}
                placeholder="Nhập mô tả..."
              />
              {formData.description.length > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => removeArrayField('description', index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayField('description')}>
            <Plus className="h-4 w-4 mr-2" /> Thêm mô tả
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Chính sách</Label>
          {formData.policy.map((policy, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={policy}
                onChange={(e) => handleArrayFieldChange('policy', index, e.target.value)}
                placeholder="Nhập chính sách..."
              />
              {formData.policy.length > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => removeArrayField('policy', index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayField('policy')}>
            <Plus className="h-4 w-4 mr-2" /> Thêm chính sách
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Thumbnail Upload */}
           <div className="space-y-2">
             <Label htmlFor="thumbnail" className="text-sm font-medium">Ảnh thumbnail</Label>
             
             {/* Hiển thị thumbnail hiện có khi edit */}
             {isEdit && editingAccount?.thumbnail && !formData.thumbnail && (
               <div className="mt-2 p-2 border rounded-md bg-gray-50">
                 <div className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</div>
                 <img 
                   src={`http://localhost:5000/api/files/${editingAccount.thumbnail}`}
                   alt="Current thumbnail"
                   className="w-20 h-20 object-cover rounded border"
                   onError={(e) => {
                     e.currentTarget.style.display = 'none'
                   }}
                 />
               </div>
             )}
             
             <div className="relative">
               <Input
                 id="thumbnail"
                 type="file"
                 accept="image/*"
                 onChange={(e) => handleFileChange('thumbnail', e.target.files)}
                 className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
               />
               <p className="text-xs text-muted-foreground mt-1">{isEdit ? "Chọn ảnh mới để thay thế" : "Chọn ảnh đại diện"}</p>
             </div>
             {formData.thumbnail && (
               <div className="mt-2 p-2 border rounded-md bg-blue-50">
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-blue-700 truncate">{formData.thumbnail.name}</span>
                   <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     onClick={() => setFormData(prev => ({ ...prev, thumbnail: null }))}
                     className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                   >
                     ×
                   </Button>
                 </div>
               </div>
             )}
           </div>

           {/* Image Preview Upload */}
           <div className="space-y-2">
             <Label htmlFor="imagepreview" className="text-sm font-medium">Ảnh preview</Label>
             
             {/* Hiển thị image preview hiện có khi edit */}
             {isEdit && editingAccount?.imagepreview && editingAccount.imagepreview.length > 0 && (!formData.imagepreview || formData.imagepreview.length === 0) && (
               <div className="mt-2 p-2 border rounded-md bg-gray-50">
                 <div className="text-sm text-gray-600 mb-2">Ảnh preview hiện tại:</div>
                 <div className="grid grid-cols-3 gap-2">
                   {editingAccount.imagepreview.map((imageId, index) => (
                     <img 
                       key={index}
                       src={`http://localhost:5000/api/files/${imageId}`}
                       alt={`Preview ${index + 1}`}
                       className="w-16 h-16 object-cover rounded border"
                       onError={(e) => {
                         e.currentTarget.style.display = 'none'
                       }}
                     />
                   ))}
                 </div>
               </div>
             )}
             
             <div className="relative">
               <Input
                 id="imagepreview"
                 type="file"
                 accept="image/*"
                 multiple
                 onChange={(e) => handleFileChange('imagepreview', e.target.files)}
                 className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
               />
               <p className="text-xs text-muted-foreground mt-1">{isEdit ? "Chọn ảnh mới để thay thế" : "Chọn nhiều ảnh preview"}</p>
             </div>
             {formData.imagepreview && formData.imagepreview.length > 0 && (
               <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                 {Array.from(formData.imagepreview).map((file, index) => (
                   <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-green-50">
                     <span className="text-sm text-green-700 truncate">{file.name}</span>
                     <Button
                       type="button"
                       variant="ghost"
                       size="sm"
                       onClick={() => {
                         const newFiles = Array.from(formData.imagepreview || []).filter((_, i) => i !== index)
                         setFormData(prev => ({ ...prev, imagepreview: newFiles.length > 0 ? newFiles : null }))
                       }}
                       className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                     >
                       ×
                     </Button>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Video Preview Upload */}
           <div className="space-y-2">
             <Label htmlFor="videopreview" className="text-sm font-medium">Video preview</Label>
             
             {/* Hiển thị video preview hiện có khi edit */}
             {isEdit && editingAccount?.videopreview && editingAccount.videopreview.length > 0 && (!formData.videopreview || formData.videopreview.length === 0) && (
               <div className="mt-2 p-2 border rounded-md bg-gray-50">
                 <div className="text-sm text-gray-600 mb-2">Video preview hiện tại:</div>
                 <div className="space-y-2">
                   {editingAccount.videopreview.map((videoId, index) => (
                     <div key={index} className="border rounded p-2">
                       <video 
                         src={`http://localhost:5000/api/files/${videoId}`}
                         className="w-full h-32 object-cover rounded"
                         controls
                         onError={(e) => {
                           e.currentTarget.style.display = 'none'
                         }}
                       />
                       <div className="text-xs text-gray-500 mt-1">Video {index + 1}</div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             
             <div className="relative">
               <Input
                 id="videopreview"
                 type="file"
                 accept="video/*"
                 multiple
                 onChange={(e) => handleFileChange('videopreview', e.target.files)}
                 className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
               />
               <p className="text-xs text-muted-foreground mt-1">{isEdit ? "Chọn video mới để thay thế" : "Chọn video demo"}</p>
             </div>
             {formData.videopreview && formData.videopreview.length > 0 && (
               <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                 {Array.from(formData.videopreview).map((file, index) => (
                   <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-purple-50">
                     <span className="text-sm text-purple-700 truncate">{file.name}</span>
                     <Button
                       type="button"
                       variant="ghost"
                       size="sm"
                       onClick={() => {
                         const newFiles = Array.from(formData.videopreview || []).filter((_, i) => i !== index)
                         setFormData(prev => ({ ...prev, videopreview: newFiles.length > 0 ? newFiles : null }))
                       }}
                       className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                     >
                       ×
                     </Button>
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => {
            if (isEdit) {
              setIsEditDialogOpen(false)
            } else {
              setIsCreateDialogOpen(false)
            }
            resetForm()
          }}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <>
      <DashboardSidebar />
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Quản lý tài khoản</h1>
            <p className="text-muted-foreground">Tạo, chỉnh sửa và quản lý tài khoản sản phẩm</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle>Danh sách tài khoản</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm tài khoản..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tất cả">Tất cả</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => resetForm()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo tài khoản
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Tạo tài khoản mới</DialogTitle>
                      </DialogHeader>
                      {renderAccountForm(false)}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2 text-muted-foreground">Đang tải tài khoản...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={fetchAccounts} variant="outline">
                    Thử lại
                  </Button>
                </div>
              )}

              {/* Accounts Table */}
              {!loading && !error && (
                <>
                  {filteredAccounts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium">Tên sản phẩm</th>
                            <th className="text-left py-3 px-4 font-medium">Danh mục</th>
                            <th className="text-left py-3 px-4 font-medium">Giá</th>
                            <th className="text-left py-3 px-4 font-medium">Giảm giá</th>
                            <th className="text-left py-3 px-4 font-medium">Gói thời gian</th>
                            <th className="text-left py-3 px-4 font-medium">Tồn kho</th>
                            <th className="text-left py-3 px-4 font-medium">Ngày tạo</th>
                            <th className="text-left py-3 px-4 font-medium">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAccounts.map((account) => (
                            <tr key={account._id} className="border-b border-border hover:bg-muted/50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  {account.thumbnail && (
                                    <img
                                      src={`http://localhost:5000/api/files/${account.thumbnail}`}
                                      alt={account.name}
                                      className="w-10 h-10 rounded object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium">{account.name}</p>
                                    <p className="text-sm text-muted-foreground truncate max-w-xs">
                                      {account.description?.[0] || "Không có mô tả"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {account.category.map(cat => (
                                  <Badge key={cat} variant="secondary" className="mr-1">
                                    {cat}
                                  </Badge>
                                ))}
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium">{account.price.toLocaleString("vi-VN")}đ</p>
                                  {account.originalPrice && (
                                    <p className="text-sm text-muted-foreground line-through">
                                      {account.originalPrice.toLocaleString("vi-VN")}đ
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {account.Discount ? (
                                  <Badge variant="destructive">{account.Discount}%</Badge>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="outline">
                                  {account.duration === '1_month' && '1 tháng'}
                                  {account.duration === '3_months' && '3 tháng'}
                                  {account.duration === '6_months' && '6 tháng'}
                                  {account.duration === '1_year' && '1 năm'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <span className={account.stock && account.stock > 0 ? "text-green-600" : "text-red-600"}>
                                  {account.stock || 0}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {new Date(account.createdAt).toLocaleDateString("vi-VN")}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(account)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Bạn có chắc chắn muốn xóa tài khoản "{account.name}"? Hành động này không thể hoàn tác.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteAccount(account._id)}
                                          className="bg-red-500 hover:bg-red-600"
                                        >
                                          Xóa
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">Không tìm thấy tài khoản nào</p>
                      <Button onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("Tất cả")
                      }} variant="outline">
                        Xóa bộ lọc
                      </Button>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalCount > itemsPerPage && (
                    <div className="flex justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Trang trước
                      </Button>
                      <span className="flex items-center px-4 text-sm text-muted-foreground">
                        Trang {currentPage} / {Math.ceil(totalCount / itemsPerPage)}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                      >
                        Trang sau
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
              </DialogHeader>
              {renderAccountForm(true)}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </>
  )
}