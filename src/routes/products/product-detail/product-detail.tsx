import { useParams } from "react-router-dom"

import { TwoColumnPageSkeleton } from "../../../components/common/skeleton"
import { TwoColumnPage } from "../../../components/layout/pages"
import { useProduct } from "../../../hooks/api/products"
import { ProductAttributeSection } from "./components/product-attribute-section"
import { ProductGeneralSection } from "./components/product-general-section"
import { ProductMediaSection } from "./components/product-media-section"
import { ProductOptionSection } from "./components/product-option-section"
import { ProductOrganizationSection } from "./components/product-organization-section"
import { ProductRichTextSection } from "./components/product-rich-text-section"
import { ProductVariantSection } from "./components/product-variant-section"

import { useDashboardExtension } from "../../../extensions"
// import { ProductShippingProfileSection } from './components/product-shipping-profile-section';

export const ProductDetail = () => {
  const { id } = useParams()
  const { product, isLoading, isError, error } = useProduct(id!, {
    fields: "*variants.inventory_items,*categories",
  })

  const { getWidgets } = useDashboardExtension()

  const after = getWidgets("product.details.after")
  const before = getWidgets("product.details.before")
  const sideAfter = getWidgets("product.details.side.after")
  const sideBefore = getWidgets("product.details.side.before")

  if (isLoading || !product) {
    return <TwoColumnPageSkeleton mainSections={4} sidebarSections={3} />
  }

  if (isError) {
    throw error
  }
  const editable = product.status !== "proposed"

  return (
    <TwoColumnPage
      widgets={{
        after,
        before,
        sideAfter,
        sideBefore,
      }}
      data={product}
    >
      <TwoColumnPage.Main>
        <ProductGeneralSection product={product} editable={editable} />
        <ProductMediaSection product={product} editable={editable}/>
        <ProductOptionSection product={product} editable={editable}/>
        <ProductVariantSection product={product} editable={editable}/>
        <ProductRichTextSection product={product} editable={editable}/>
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        {/* <ProductShippingProfileSection product={product} /> */}
        <ProductOrganizationSection product={product}  editable={editable}/>
        <ProductAttributeSection product={product}  editable={editable} />
        {/* <ProductAdditionalAttributesSection product={product as any} /> */}
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  )
}
