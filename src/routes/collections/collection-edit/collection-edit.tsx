import { Heading } from "@medusajs/ui"
import { useParams } from "react-router-dom"
import { RouteDrawer } from "../../../components/modals"
import { EditCollectionForm } from "./components/edit-collection-form"
import { useCollection } from "../../../hooks/api"

export const CollectionEdit = () => {
  const { id } = useParams()
  const { product_collection, isPending, isError, error } = useCollection(id!)

  const ready = !isPending && !!product_collection

  if (isError) {
    throw error
  }
  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>Edit Product Collection Request</Heading>
      </RouteDrawer.Header>
      {ready && (
        <EditCollectionForm collection={product_collection} requestId={id!} />
      )}
    </RouteDrawer>
  )
}
