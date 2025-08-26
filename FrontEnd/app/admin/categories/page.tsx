'use client';

import { useState, useEffect } from 'react';
import { categoryApi, type Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Search, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
  slug: '',
  isActive: true,
  sortOrder: 0
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAll(undefined, undefined, searchTerm, isActiveFilter);
      if (response.success) {
        setCategories(response.data || []);
      } else {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách danh mục',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi tải danh mục',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm, isActiveFilter]);

  // Handle form input changes
  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  // Handle create category
  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Tên danh mục không được để trống',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await categoryApi.create({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        slug: formData.slug.trim() || undefined,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder
      });

      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Tạo danh mục thành công',
        });
        setIsCreateDialogOpen(false);
        setFormData(initialFormData);
        fetchCategories();
      } else {
        toast({
          title: 'Lỗi',
          description: response.message || 'Không thể tạo danh mục',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi tạo danh mục',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit category
  const handleEditCategory = async () => {
    if (!selectedCategory || !formData.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Tên danh mục không được để trống',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await categoryApi.update(selectedCategory._id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        slug: formData.slug.trim() || undefined,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder
      });

      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Cập nhật danh mục thành công',
        });
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
        setFormData(initialFormData);
        fetchCategories();
      } else {
        toast({
          title: 'Lỗi',
          description: response.message || 'Không thể cập nhật danh mục',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi cập nhật danh mục',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    try {
      const response = await categoryApi.delete(category._id);
      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Xóa danh mục thành công',
        });
        fetchCategories();
      } else {
        toast({
          title: 'Lỗi',
          description: response.message || 'Không thể xóa danh mục',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi xóa danh mục',
        variant: 'destructive',
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setIsEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsViewDialogOpen(true);
  };

  // Filter categories
  const filteredCategories = categories?.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = isActiveFilter === undefined || category.isActive === isActiveFilter;
    return matchesSearch && matchesActive;
  }) || [];

  return (
    <>
      <DashboardSidebar />
      <div className="flex-1 overflow-auto lg:pl-64">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
              <p className="text-muted-foreground">Quản lý danh mục sản phẩm trong hệ thống</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo danh mục
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tạo danh mục mới</DialogTitle>
                  <DialogDescription>
                    Điền thông tin để tạo danh mục mới
                  </DialogDescription>
                </DialogHeader>
                <CategoryForm
                  formData={formData}
                  onInputChange={handleInputChange}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setFormData(initialFormData);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang tạo...' : 'Tạo danh mục'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên, mô tả hoặc slug..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={isActiveFilter === undefined ? 'default' : 'outline'}
                    onClick={() => setIsActiveFilter(undefined)}
                  >
                    Tất cả
                  </Button>
                  <Button
                    variant={isActiveFilter === true ? 'default' : 'outline'}
                    onClick={() => setIsActiveFilter(true)}
                  >
                    Hoạt động
                  </Button>
                  <Button
                    variant={isActiveFilter === false ? 'default' : 'outline'}
                    onClick={() => setIsActiveFilter(false)}
                  >
                    Không hoạt động
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách danh mục ({filteredCategories.length})</CardTitle>
              <CardDescription>
                Quản lý tất cả danh mục sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Đang tải...</p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Không có danh mục nào</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thứ tự</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {category.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.isActive ? 'default' : 'secondary'}>
                            {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </Badge>
                        </TableCell>
                        <TableCell>{category.sortOrder}</TableCell>
                        <TableCell>
                          {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViewDialog(category)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin danh mục
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            onInputChange={handleInputChange}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedCategory(null);
                setFormData(initialFormData);
              }}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleEditCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chi tiết danh mục</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Tên danh mục</Label>
                <p className="text-sm text-muted-foreground">{selectedCategory.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Slug</Label>
                <p className="text-sm text-muted-foreground">
                  <code className="bg-muted px-2 py-1 rounded">{selectedCategory.slug}</code>
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Mô tả</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory.description || 'Không có mô tả'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Trạng thái</Label>
                <p className="text-sm text-muted-foreground">
                  <Badge variant={selectedCategory.isActive ? 'default' : 'secondary'}>
                    {selectedCategory.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Thứ tự sắp xếp</Label>
                <p className="text-sm text-muted-foreground">{selectedCategory.sortOrder}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Ngày tạo</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedCategory.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Ngày cập nhật</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedCategory.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setIsViewDialogOpen(false);
                setSelectedCategory(null);
              }}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Category Form Component
interface CategoryFormProps {
  formData: CategoryFormData;
  onInputChange: (field: keyof CategoryFormData, value: string | boolean | number) => void;
}

function CategoryForm({ formData, onInputChange }: CategoryFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Tên danh mục *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Nhập tên danh mục"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => onInputChange('slug', e.target.value)}
          placeholder="Tự động tạo từ tên danh mục"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Nhập mô tả danh mục"
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
        <Input
          id="sortOrder"
          type="number"
          value={formData.sortOrder}
          onChange={(e) => onInputChange('sortOrder', parseInt(e.target.value) || 0)}
          placeholder="0"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => onInputChange('isActive', checked)}
        />
        <Label htmlFor="isActive">Kích hoạt danh mục</Label>
      </div>
    </div>
  );
}