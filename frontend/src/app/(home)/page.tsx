import BrowsingHistoryList from '@/src/components/shared/common/browsing-history-list'
import { HomeCard } from '@/src/components/shared/home/home-card'
import { HomeCarousel } from '@/src/components/shared/home/home-carousel'
import ProductSlider from '@/src/components/shared/product/product-slider'
import { Card, CardContent } from '@/src/components/ui/card'

import {
  getProductsForCard,
  getAllCategories,
  getProductsByTag,
} from '@/src/lib/actions/product.actions'
import data from '@/src/lib/data'
import { toSlug } from '@/src/lib/utils/utils'


export default async function HomePage() {
  // ✅ Fix: Assert getAllCategories() as string[]
  const categories = (await getAllCategories() as string[]).slice(0, 4)

  const newArrivals = await getProductsForCard({
    tag: 'new-arrival',
    limit: 4,
  })

  const featureds = await getProductsForCard({
    tag: 'featured',
    limit: 4,
  })

  const bestSellers = await getProductsForCard({
    tag: 'best-seller',
    limit: 4,
  })

  const cards = [
    {
      title: 'Categories to explore',
      link: {
        text: 'See More',
        href: '/search',
      },
      items: categories.map((category) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
    },
    {
      title: 'Explore New Arrivals',
      items: newArrivals,
      link: {
        text: 'View All',
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: 'Discover Best Sellers',
      items: bestSellers,
      link: {
        text: 'View All',
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: 'Featured Products',
      items: featureds,
      link: {
        text: 'Shop Now',
        href: '/search?tag=new-arrival',
      },
    },
  ]

  const todaysDeals = await getProductsByTag({ tag: 'todays-deal' })
  const bestSellingProducts = await getProductsByTag({ tag: 'best-seller' })

  return (
    <>
      <HomeCarousel items={data.carousels} />
      <div className="md:p-4 md:space-y-4 bg-border">
        <HomeCard cards={cards} />
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider title={"Today's Deal"} products={todaysDeals} />
          </CardContent>
        </Card>
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider
              title={"Best Selling Products"}
              products={bestSellingProducts}
              hideDetails // Hide the product details
            />
          </CardContent>
        </Card>
      </div>
      <div className='p-4 bg-background'>
        <BrowsingHistoryList/>
      </div>
    </>
  )
}
