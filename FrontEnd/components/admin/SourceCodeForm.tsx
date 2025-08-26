"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { type Category, type SourceCode } from "@/lib/api"
import { SourceCodeFormData } from "@/types/source-code"

// Base URL cho file server
const FILES_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface SourceCodeFormProps {
  formData: SourceCodeFormData
  setFormData: (formData: SourceCodeFormData | ((prev: SourceCodeFormData) => SourceCodeFormData)) => void
  categories: Category[]
  isSubmitting: boolean
  isEdit?: boolean
  editingSourceCode?: SourceCode | null
  onSubmit: (e: React.FormEvent) => Promise<void>
  handleFileChange: (field: keyof SourceCodeFormData, files: FileList | null) => void
  handleArrayFieldChange: (field: 'description' | 'policy', index: number, value: string) => void
  addArrayField: (field: 'description' | 'policy') => void
  removeArrayField: (field: 'description' | 'policy', index: number) => void
  handleTagsChange: (value: string) => void
}

export const SourceCodeForm: React.FC<SourceCodeFormProps> = ({
  formData,
  setFormData,
  categories,
  isSubmitting,
  isEdit = false,
  editingSourceCode,
  onSubmit,
  handleFileChange,
  handleArrayFieldChange,
  addArrayField,
  removeArrayField,
  handleTagsChange,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sourcecode-name">Tên source code *</Label>
        <Input
          id="sourcecode-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          placeholder="Nhập tên source code"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourcecode-category">Danh mục *</Label>
        <Select onValueChange={(value) => {
          if (!formData.category.includes(value)) {
            setFormData(prev => ({ ...prev, category: [...prev.category, value] }))
          }
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục để thêm" />
          </SelectTrigger>
          <SelectContent>
            {categories.filter(cat => !formData.category.includes(cat._id)).map(cat => (
              <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.category.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.category.map(categoryId => {
              const category = categories.find(cat => cat._id === categoryId)
              return (
                <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                  {category?.name || categoryId}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      category: prev.category.filter(id => id !== categoryId)
                    }))}
                    className="ml-1 text-xs hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sourcecode-price">Giá bán *</Label>
          <Input
            id="sourcecode-price"
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
          <Label htmlFor="sourcecode-discount">Giảm giá (%)</Label>
          <Input
            id="sourcecode-discount"
            type="number"
            min="0"
            max="100"
            step="1"
            value={formData.discountPercent || ""}
            onChange={(e) => {
              const value = e.target.value
              if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
                setFormData(prev => ({ ...prev, discountPercent: value === "" ? undefined : Number(value) }))
              }
            }}
            placeholder="Nhập % giảm giá"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourcecode-tags">Tags</Label>
        <Input
          id="sourcecode-tags"
          value={formData.tags.join(', ')}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="Nhập tags, phân cách bằng dấu phẩy"
        />
        <p className="text-xs text-muted-foreground">Ví dụ: React, JavaScript, Frontend</p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="sourcecode-active"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="rounded border-gray-300"
        />
        <Label htmlFor="sourcecode-active">Kích hoạt</Label>
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

      {/* File uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thumbnail Upload */}
        <div className="space-y-2">
          <Label htmlFor="thumbnail" className="text-sm font-medium">Ảnh thumbnail</Label>
          
          {isEdit && editingSourceCode?.thumbnailImage && !formData.thumbnail && (
            <div className="mt-2 p-2 border rounded-md bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</div>
              <img 
                src={`${FILES_BASE_URL}/api/files/${editingSourceCode.thumbnailImage}`}
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
                  onClick={() => setFormData(prev => ({ ...prev, thumbnail: undefined }))}
                  className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Source Code File Upload */}
        <div className="space-y-2">
          <Label htmlFor="sourceCodeFile" className="text-sm font-medium">File source code *</Label>
          
          {isEdit && editingSourceCode?.sourceCodeFile && !formData.sourceCodeFile && (
            <div className="mt-2 p-2 border rounded-md bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">File hiện tại:</div>
              <div className="text-sm font-medium text-blue-600">
                {editingSourceCode.sourceCodeFile}
              </div>
            </div>
          )}
          
          <div className="relative">
            <Input
              id="sourceCodeFile"
              type="file"
              accept=".zip,.rar,.7z,.tar.gz"
              onChange={(e) => handleFileChange('sourceCodeFile', e.target.files)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              required={!isEdit}
            />
            <p className="text-xs text-muted-foreground mt-1">{isEdit ? "Chọn file mới để thay thế" : "Chọn file source code (ZIP, RAR, 7Z)"}</p>
          </div>
          {formData.sourceCodeFile && (
            <div className="mt-2 p-2 border rounded-md bg-green-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700 truncate">{formData.sourceCodeFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, sourceCodeFile: undefined }))}
                  className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Upload */}
      <div className="space-y-2">
        <Label htmlFor="imagePreview" className="text-sm font-medium">Ảnh preview</Label>
        
        {isEdit && editingSourceCode?.imagePreview && editingSourceCode.imagePreview.length > 0 && (!formData.imagePreview || formData.imagePreview.length === 0) && (
          <div className="mt-2 p-2 border rounded-md bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</div>
            <div className="grid grid-cols-3 gap-2">
              {editingSourceCode.imagePreview.map((img, index) => (
                <img 
                  key={index}
                  src={`${FILES_BASE_URL}/api/files/${img}`}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded border"
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
            id="imagePreview"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange('imagePreview', e.target.files)}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          <p className="text-xs text-muted-foreground mt-1">Chọn nhiều ảnh để preview sản phẩm</p>
        </div>
        {formData.imagePreview && formData.imagePreview.length > 0 && (
          <div className="mt-2 p-2 border rounded-md bg-purple-50">
            <div className="text-sm text-purple-700 mb-2">Đã chọn {formData.imagePreview.length} ảnh:</div>
            <div className="space-y-1">
              {Array.from(formData.imagePreview).map((file, index) => (
                <div key={index} className="text-xs text-purple-600 truncate">{file.name}</div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, imagePreview: undefined }))}
              className="text-red-600 hover:text-red-800 mt-2"
            >
              Xóa tất cả
            </Button>
          </div>
        )}
      </div>

      {/* Video Preview Upload */}
      <div className="space-y-2">
        <Label htmlFor="videoPreview" className="text-sm font-medium">Video preview</Label>
        
        {/* Hiển thị video preview hiện tại nếu đang sửa và chưa chọn file mới */}
        {isEdit && editingSourceCode?.videoPreview && editingSourceCode.videoPreview.length > 0 && (!formData.videoPreview || formData.videoPreview.length === 0) && (
          <div className="mt-2 p-2 border rounded-md bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">Video preview hiện tại:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {editingSourceCode.videoPreview.map((vid, index) => (
                <video
                  key={index}
                  src={`${FILES_BASE_URL}/api/files/${vid}`}
                  controls
                  className="w-full h-40 rounded border bg-black"
                  onError={(e) => {
                    // Ẩn video lỗi
                    (e.currentTarget as HTMLVideoElement).style.display = 'none'
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="relative">
          <Input
            id="videoPreview"
            type="file"
            accept="video/*"
            multiple
            onChange={(e) => handleFileChange('videoPreview', e.target.files)}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
          <p className="text-xs text-muted-foreground mt-1">Chọn video để preview sản phẩm</p>
        </div>
        {formData.videoPreview && formData.videoPreview.length > 0 && (
          <div className="mt-2 p-2 border rounded-md bg-orange-50">
            <div className="text-sm text-orange-700 mb-2">Đã chọn {formData.videoPreview.length} video:</div>
            <div className="space-y-1">
              {Array.from(formData.videoPreview).map((file, index) => (
                <div key={index} className="text-xs text-orange-600 truncate">{file.name}</div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, videoPreview: undefined }))}
              className="text-red-600 hover:text-red-800 mt-2"
            >
              Xóa tất cả
            </Button>
          </div>
        )}
      </div>

      {/* Video Tutorial Upload */}
      <div className="space-y-2">
        <Label htmlFor="videoTutorial" className="text-sm font-medium">Video hướng dẫn</Label>
        
        {/* Hiển thị video hướng dẫn hiện tại nếu đang sửa và chưa chọn file mới */}
        {isEdit && editingSourceCode?.videoTutorial && editingSourceCode.videoTutorial.length > 0 && (!formData.videoTutorial || formData.videoTutorial.length === 0) && (
          <div className="mt-2 p-2 border rounded-md bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">Video hướng dẫn hiện tại:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {editingSourceCode.videoTutorial.map((vid, index) => (
                <video
                  key={index}
                  src={`${FILES_BASE_URL}/api/files/${vid}`}
                  controls
                  className="w-full h-40 rounded border bg-black"
                  onError={(e) => {
                    (e.currentTarget as HTMLVideoElement).style.display = 'none'
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="relative">
          <Input
            id="videoTutorial"
            type="file"
            accept="video/*"
            multiple
            onChange={(e) => handleFileChange('videoTutorial', e.target.files)}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
          />
          <p className="text-xs text-muted-foreground mt-1">Chọn video hướng dẫn sử dụng</p>
        </div>
        {formData.videoTutorial && formData.videoTutorial.length > 0 && (
          <div className="mt-2 p-2 border rounded-md bg-teal-50">
            <div className="text-sm text-teal-700 mb-2">Đã chọn {formData.videoTutorial.length} video:</div>
            <div className="space-y-1">
              {Array.from(formData.videoTutorial).map((file, index) => (
                <div key={index} className="text-xs text-teal-600 truncate">{file.name}</div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, videoTutorial: undefined }))}
              className="text-red-600 hover:text-red-800 mt-2"
            >
              Xóa tất cả
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  )
}