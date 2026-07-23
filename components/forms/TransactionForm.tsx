// components/forms/TransactionForm.tsx

'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertCircle } from 'lucide-react'

import { Input, Select, Textarea, Button } from '@/components/ui'
import { useCategorieStore } from '@/store/categorieStore'
import { useMemberStore } from '@/store/memberStore'

import type { TransactionFormData } from '@/types'
import { formatDateForInput } from '@/utils/formatters'


const transactionSchema = z.object({

  type: z.enum(['entree', 'sortie']),

  categorieId: z
    .string()
    .min(1, 'La catégorie est requise'),

  membreId: z
    .string()
    .optional(),

  montant: z
    .number({
      error: 'Le montant est requis',
    })
    .refine(
      (value) => !Number.isNaN(value),
      {
        message: 'Le montant est requis',
      }
    )
    .min(
      0.01,
      'Le montant doit être supérieur à 0'
    )
    .max(
      999999999,
      'Le montant est trop élevé'
    ),

  devise: z.enum(['USD', 'CDF']),

  dateTransaction: z
    .string()
    .min(1, 'La date est requise'),

  description: z
    .string()
    .optional(),

})


type TransactionFormValues = z.infer<typeof transactionSchema>


interface TransactionFormProps {

  initialData?: TransactionFormData

  onSubmit: (
    data: TransactionFormData
  ) => Promise<void>

  isSubmitting?: boolean

}



export const TransactionForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}: TransactionFormProps) => {


  const {
    categories,
    entrees,
    sorties,
    isLoading: categoriesLoading,
    fetchCategories,
  } = useCategorieStore()


  const {
    members,
    isLoading: membersLoading,
    fetchMembers,
  } = useMemberStore()



  const [
    selectedType,
    setSelectedType
  ] = useState<'entree' | 'sortie'>('entree')


  const [
    error,
    setError
  ] = useState<string | null>(null)



  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    clearErrors,
    formState:{
      errors
    }

  } = useForm<TransactionFormValues>({

    resolver:zodResolver(transactionSchema),

    defaultValues:{

      type:'entree',

      categorieId:'',

      membreId:'',

      montant:0,

      devise:'CDF',

      dateTransaction:
        formatDateForInput(new Date()),

      description:'',

    }

  })



  const watchedType = watch('type')



  useEffect(()=>{

    void fetchCategories()

    void fetchMembers({
      limit:100
    })

  },[
    fetchCategories,
    fetchMembers
  ])





  useEffect(()=>{

    if(!initialData) return


    reset({

      type:initialData.type,

      categorieId:
        initialData.categorieId,

      membreId:
        initialData.membreId ?? '',

      montant:
        Number(initialData.montant),

      devise:
        initialData.devise,

      dateTransaction:
        initialData.dateTransaction
        ? formatDateForInput(
            new Date(initialData.dateTransaction)
          )
        : formatDateForInput(new Date()),

      description:
        initialData.description ?? '',

    })


    setSelectedType(
      initialData.type
    )


  },[
    initialData,
    reset
  ])





  useEffect(()=>{

    setSelectedType(
      watchedType
    )

  },[
    watchedType
  ])





  const submitForm = async(
    data: TransactionFormValues
  )=>{


    try {


      setError(null)



      const payload: TransactionFormData = {

        type:data.type,

        categorieId:
          data.categorieId,

        membreId:
          data.membreId?.trim()
          || undefined,

        montant:
          data.montant,

        devise:
          data.devise,

        dateTransaction:
          data.dateTransaction,

        description:
          data.description?.trim()
          || undefined,

      }



      await onSubmit(payload)



      reset({

        type:'entree',

        categorieId:'',

        membreId:'',

        montant:0,

        devise:'CDF',

        dateTransaction:
          formatDateForInput(new Date()),

        description:'',

      })


    } catch(error){

      const err = error as {
        message?:string
      }


      setError(
        err.message ??
        'Une erreur est survenue'
      )

    }


  }







  const typeOptions = [

    {
      value:'entree',
      label:'Entrée'
    },

    {
      value:'sortie',
      label:'Sortie'
    }

  ]



  const deviseOptions = [

    {
      value:'CDF',
      label:'CDF (Franc congolais)'
    },

    {
      value:'USD',
      label:'USD (Dollar américain)'
    }

  ]




  const categorieOptions = [

    {
      value:'',
      label:'-- Sélectionnez une catégorie --'
    },

    ...(selectedType === 'entree'
      ? entrees
      : sorties
    ).map(c=>({

      value:c.id,

      label:c.nom

    }))

  ]





  const membreOptions = [

    {
      value:'',
      label:'-- Sélectionnez un membre --'
    },

    ...members.map(m=>({

      value:m.id,

      label:`${m.prenom} ${m.nom}`

    }))

  ]





  if(
    categoriesLoading ||
    membersLoading
  ){

    return (

      <div className="flex h-64 items-center justify-center">

        <Loader2 className="h-8 w-8 animate-spin"/>

      </div>

    )

  }







  return (

    <form
      onSubmit={
        handleSubmit(submitForm)
      }
      className="space-y-4"
    >


      {
        error && (

          <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-red-600">

            <AlertCircle className="h-5 w-5"/>

            <span>{error}</span>

          </div>

        )
      }




      <Select

        label="Type"

        options={typeOptions}

        value={watchedType}

        error={errors.type?.message}

        {...register(
          'type',
          {

            onChange:
            (
              e:ChangeEvent<HTMLSelectElement>
            )=>{

              setSelectedType(
                e.target.value as
                'entree' | 'sortie'
              )


              setValue(
                'categorieId',
                ''
              )


              clearErrors(
                'categorieId'
              )

            }

          }
        )}

      />





      <Select

        label="Catégorie"

        options={categorieOptions}

        error={
          errors.categorieId?.message
        }

        {...register(
          'categorieId'
        )}

      />





      <Select

        label="Membre"

        options={membreOptions}

        error={
          errors.membreId?.message
        }

        {...register(
          'membreId'
        )}

      />





      <Select

        label="Devise"

        options={deviseOptions}

        error={
          errors.devise?.message
        }

        {...register(
          'devise'
        )}

      />





      <Input

        label="Montant"

        type="number"

        step="0.01"

        min="0.01"

        placeholder="0.00"

        error={
          errors.montant?.message
        }

        {...register(
          'montant',
          {
            valueAsNumber:true
          }
        )}

      />





      <Input

        label="Date"

        type="date"

        error={
          errors.dateTransaction?.message
        }

        {...register(
          'dateTransaction'
        )}

      />





      <Textarea

        label="Description"

        rows={3}

        error={
          errors.description?.message
        }

        {...register(
          'description'
        )}

      />





      <div className="flex justify-end gap-3 pt-4">


        <Button

          type="button"

          variant="outline"

          onClick={() =>
            window.history.back()
          }

        >

          Annuler

        </Button>




        <Button

          type="submit"

          variant="primary"

          loading={
            isSubmitting
          }

          disabled={
            isSubmitting
          }

        >

          {
            initialData
            ? 'Modifier'
            : 'Enregistrer'
          }

        </Button>


      </div>



    </form>

  )

}