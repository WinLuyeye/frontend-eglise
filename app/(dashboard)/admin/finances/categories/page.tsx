'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'
import { Card, Button, Input, Table, Badge, Modal } from '@/components/ui'
import { useCategorieStore } from '@/store/categorieStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const categorieSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  type: z.enum(['entree', 'sortie']),
  description: z.string().optional(),
})

type CategorieFormData = z.infer<typeof categorieSchema>

export default function CategoriesPage() {
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
          <Tag className="h-4 w-4 text-gray-400" />
          <span>{c.nom}</span>
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
      cell: (c: any) => c.description || '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (c: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(c)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(c.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Catégories
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez les catégories d'entrées et de sorties
          </p>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Entrées */}
        <Card className="p-4">
          <h3 className="mb-4 font-semibold text-green-600">Catégories d'entrées</h3>
          <Table
            columns={columns}
            data={entrees}
            isLoading={isLoading}
            emptyMessage="Aucune catégorie d'entrée"
          />
        </Card>

        {/* Sorties */}
        <Card className="p-4">
          <h3 className="mb-4 font-semibold text-red-600">Catégories de sorties</h3>
          <Table
            columns={columns}
            data={sorties}
            isLoading={isLoading}
            emptyMessage="Aucune catégorie de sortie"
          />
        </Card>
      </div>

      {/* Modal formulaire */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingId(null)
          reset()
        }}
        title={editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nom"
            placeholder="Ex: Offrande, Dîme, Achats..."
            error={errors.nom?.message}
            {...register('nom')}
          />
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select
              className="w-full rounded-lg border p-2"
              {...register('type')}
            >
              <option value="entree">Entrée</option>
              <option value="sortie">Sortie</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>
          <Input
            label="Description"
            placeholder="Description de la catégorie"
            {...register('description')}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {editingId ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            <p className="mt-2 text-gray-600">Cette action est irréversible.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(null)}>
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