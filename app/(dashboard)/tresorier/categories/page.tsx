// app/(dashboard)/tresorier/categories/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Tag, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, Button, Input, Table, Badge, Modal, Select } from '@/components/ui'
import { useCategorieStore } from '@/store/categorieStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const categorieSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis').max(50, 'Nom trop long'),
  type: z.enum(['entree', 'sortie']),
  description: z.string().optional(),
})

type CategorieFormData = z.infer<typeof categorieSchema>

export default function TresorierCategoriesPage() {
  const router = useRouter()
  const { categories, entrees, sorties, isLoading, fetchCategories, createCategorie, updateCategorie, deleteCategorie } = useCategorieStore()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategorieFormData>({
    resolver: zodResolver(categorieSchema),
    defaultValues: {
      nom: '',
      type: 'entree',
      description: '',
    },
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const onSubmit = async (data: CategorieFormData) => {
    if (editingId) {
      await updateCategorie(editingId, data)
    } else {
      await createCategorie(data)
    }
    setShowModal(false)
    reset()
    setEditingId(null)
  }

  const handleEdit = (categorie: any) => {
    setEditingId(categorie.id)
    reset({
      nom: categorie.nom,
      type: categorie.type,
      description: categorie.description || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    await deleteCategorie(id)
    setShowDeleteModal(null)
  }

  const columns = [
    {
      key: 'nom',
      header: 'Nom',
      cell: (c: any) => (
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">{c.nom}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (c: any) => (
        <Badge variant={c.type === 'entree' ? 'success' : 'danger'}>
          {c.type === 'entree' ? 'Entrée' : 'Sortie'}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (c: any) => (
        <span className="text-gray-600 dark:text-gray-400">
          {c.description || '-'}
        </span>
      ),
    },
    {
      key: 'transactions',
      header: 'Transactions',
      cell: (c: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {c._count?.transactions || 0}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (c: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(c)}
            className="rounded-lg p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(c.id)}
            className="rounded-lg p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const typeOptions = [
    { value: 'entree', label: 'Entrée' },
    { value: 'sortie', label: 'Sortie' },
  ]

  return (
    <div className="space-y-6">
      {/* En-tête - Dark mode */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Catégories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez les catégories d'entrées et de sorties</p>
        </div>
        <Button onClick={() => {
          setEditingId(null)
          reset({ nom: '', type: 'entree', description: '' })
          setShowModal(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </div>

      {/* Grille des catégories - Dark mode */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Entrées */}
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Catégories d'entrées</h3>
            <Badge variant="success" size="sm">{entrees.length}</Badge>
          </div>
          <Table
            columns={columns}
            data={entrees}
            isLoading={isLoading}
            emptyMessage="Aucune catégorie d'entrée"
          />
        </Card>

        {/* Sorties */}
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="mb-4 flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Catégories de sorties</h3>
            <Badge variant="danger" size="sm">{sorties.length}</Badge>
          </div>
          <Table
            columns={columns}
            data={sorties}
            isLoading={isLoading}
            emptyMessage="Aucune catégorie de sortie"
          />
        </Card>
      </div>

      {/* Modal formulaire - Dark mode */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingId(null)
          reset()
        }}
        title={editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        className="dark:bg-gray-900 dark:border-gray-800"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nom"
            placeholder="Ex: Offrande, Dîme, Achats..."
            error={errors.nom?.message}
            {...register('nom')}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <Select
            label="Type"
            options={typeOptions}
            error={errors.type?.message}
            {...register('type')}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Input
            label="Description"
            placeholder="Description de la catégorie"
            {...register('description')}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowModal(false)}
              className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Annuler
            </Button>
            <Button type="submit">
              {editingId ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal suppression - Dark mode */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cette action est irréversible.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(null)}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button variant="danger" onClick={() => handleDelete(showDeleteModal)}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}