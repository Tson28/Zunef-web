"use client"

import React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useSourceCodeData } from "@/hooks/useSourceCodeData"
import { SourceCodeForm } from "@/components/admin/SourceCodeForm"
import { SourceCodeTable } from "@/components/admin/SourceCodeTable"
import { SearchAndFilter } from "@/components/admin/SearchAndFilter"

export default function AdminSourceCodesPage() {
  const { user } = useAuth()
  const {
    // State
    sourceCodes,
    categories,
    loading,
    error,
    searchQuery,
    selectedCategory,
    currentPage,
    totalCount,
    isCreateDialogOpen,
    isEditDialogOpen,
    editingSourceCode,
    isSubmitting,
    formData,
    
    // Actions
    setSearchQuery,
    setSelectedCategory,
    setCurrentPage,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    handleCreateSourceCode,
    handleEditSourceCode,
    handleDeleteSourceCode,
    resetForm,
    setFormData,
    handleFileChange,
    handleArrayFieldChange,
    addArrayField,
    removeArrayField,
    handleTagsChange,
    openEditDialog,
  } = useSourceCodeData()

  const itemsPerPage = 10

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category ? category.name : categoryId
  }

  // Filter source codes
  const filteredSourceCodes = sourceCodes?.filter(sourceCode => {
    const matchesSearch = sourceCode.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Tất cả" || (sourceCode.category && sourceCode.category.includes(selectedCategory))
    return matchesSearch && matchesCategory
  }) || []

  const handleCreateSubmit = async (e: React.FormEvent) => {
    await handleCreateSourceCode(e)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    await handleEditSourceCode(e)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Truy cập bị từ chối</h1>
          <p className="text-muted-foreground">Bạn cần đăng nhập để truy cập trang này.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardSidebar />
      <div className="flex-1 overflow-auto lg:pl-64">
        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Quản lý Source Code</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Quản lý danh sách source code và thông tin chi tiết
                  </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm source code
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Thêm source code mới</DialogTitle>
                    </DialogHeader>
                    <SourceCodeForm
                      formData={formData}
                      setFormData={setFormData}
                      categories={categories}
                      isSubmitting={isSubmitting}
                      onSubmit={handleCreateSubmit}
                      handleFileChange={handleFileChange}
                      handleArrayFieldChange={handleArrayFieldChange}
                      addArrayField={addArrayField}
                      removeArrayField={removeArrayField}
                      handleTagsChange={handleTagsChange}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}

              <SearchAndFilter
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                categories={categories}
                onSearchChange={setSearchQuery}
                onCategoryChange={setSelectedCategory}
              />

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : (
                <>
                  <SourceCodeTable
                    sourceCodes={filteredSourceCodes}
                    categories={categories}
                    loading={loading}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteSourceCode}
                    getCategoryName={getCategoryName}
                  />

                  {/* Pagination */}
                  {totalCount > itemsPerPage && (
                    <div className="flex justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Trang trước
                      </Button>
                      <span className="flex items-center px-4 text-sm text-muted-foreground">
                        Trang {currentPage} / {Math.ceil(totalCount / itemsPerPage)}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage + 1)}
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
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa source code</DialogTitle>
              </DialogHeader>
              <SourceCodeForm
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                isSubmitting={isSubmitting}
                onSubmit={handleEditSubmit}
                handleFileChange={handleFileChange}
                handleArrayFieldChange={handleArrayFieldChange}
                addArrayField={addArrayField}
                removeArrayField={removeArrayField}
                handleTagsChange={handleTagsChange}
                isEdit={true}
                editingSourceCode={editingSourceCode}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}