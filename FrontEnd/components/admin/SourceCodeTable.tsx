"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { type SourceCode, type Category } from "@/lib/api"
import { SourceCodeTableProps } from "@/types/source-code"

export const SourceCodeTable: React.FC<SourceCodeTableProps> = ({
  sourceCodes,
  categories,
  loading,
  onEdit,
  onDelete,
  getCategoryName,
}) => {
  // Updated grid layout for better UI
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Đang tải...</span>
        </CardContent>
      </Card>
    )
  }

  if (sourceCodes.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Không có source code nào</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sourceCodes.map((sourceCode) => (
          <Card key={sourceCode._id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 shadow-sm hover:scale-[1.03] hover:border-blue-300 bg-white overflow-hidden">
            <CardHeader className="pb-3 px-4 pt-4">
              <div className="flex items-start justify-between mb-2">
                <Badge 
                  variant={sourceCode.isActive ? "default" : "secondary"}
                  className={sourceCode.isActive ? "bg-emerald-500 text-white border-0 shadow-sm" : "bg-gray-400 text-white border-0"}
                >
                  {sourceCode.isActive ? "Hoạt động" : "Tạm dừng"}
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                {sourceCode.name}
              </CardTitle>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sourceCode.category?.slice(0, 2).map((categoryItem: string | Category, index) => {
                  // Handle both string ID and Category object
                  const categoryId = typeof categoryItem === 'string' ? categoryItem : categoryItem._id;
                  const categoryName = typeof categoryItem === 'string' ? getCategoryName(categoryItem) : categoryItem.name;
                  
                  return (
                    <Badge key={`${categoryId}-${index}`} variant="outline" className="text-xs border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100">
                      {categoryName}
                    </Badge>
                  );
                })}
                {sourceCode.category && sourceCode.category.length > 2 && (
                  <Badge variant="outline" className="text-xs border-gray-300 text-gray-500 bg-gray-50">
                    +{sourceCode.category.length - 2}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="px-4 pb-4 space-y-3">
              {/* Thumbnail và Preview */}
              <div className="relative">
                {sourceCode.thumbnailImage ? (
                  <div className="w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={`http://localhost:5000/api/files/${sourceCode.thumbnailImage}`}
                      alt="Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png'
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-md flex items-center justify-center border border-blue-200">
                    <div className="text-center text-blue-400">
                      <Eye className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">Không có ảnh</p>
                    </div>
                  </div>
                )}
                
                {/* Media indicators */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {sourceCode.imagePreview && sourceCode.imagePreview.length > 0 && (
                    <Badge variant="secondary" className="text-xs bg-black/70 text-white border-0 backdrop-blur-sm">
                      📷 {sourceCode.imagePreview.length}
                    </Badge>
                  )}
                  {sourceCode.videoPreview && sourceCode.videoPreview.length > 0 && (
                    <Badge variant="secondary" className="text-xs bg-black/70 text-white border-0 backdrop-blur-sm">
                      🎥 {sourceCode.videoPreview.length}
                    </Badge>
                  )}
                  {sourceCode.sourceCodeFile && (
                    <Badge variant="secondary" className="text-xs bg-black/70 text-white border-0 backdrop-blur-sm">
                      📁 Code
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Price */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-md border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-emerald-700 mb-1">Giá bán</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {sourceCode.price?.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  {sourceCode.discountPercent && sourceCode.discountPercent > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                      -{sourceCode.discountPercent}%
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Tags */}
              {sourceCode.tags && sourceCode.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {sourceCode.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100">
                        {tag}
                      </Badge>
                    ))}
                    {sourceCode.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-500 bg-gray-50">
                        +{sourceCode.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Description */}
              {sourceCode.description && sourceCode.description.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Mô tả</p>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {sourceCode.description[0]}
                  </p>
                </div>
              )}
              
              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">
                <span>👁️ {sourceCode.viewCount || 0}</span>
                <span>⬇️ {sourceCode.downloadCount || 0}</span>
                <span>{sourceCode.createdAt ? new Date(sourceCode.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(sourceCode)}
                  className="flex-1 h-8 text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Sửa
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa source code "{sourceCode.name}"? 
                        Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(sourceCode._id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}