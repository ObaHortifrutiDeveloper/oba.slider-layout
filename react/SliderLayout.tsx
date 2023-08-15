import React, { PropsWithChildren } from 'react'
import { defineMessages } from 'react-intl'
import { CssHandlesTypes, useCssHandles } from 'vtex.css-handles'
import { useListContext } from 'vtex.list-context'
import { useResponsiveValue } from 'vtex.responsive-values'

import Slider, { CSS_HANDLES as SliderCssHandles } from './components/Slider'
import {
  SliderContextProvider,
  SliderLayoutProps,
  SliderLayoutSiteEditorProps,
} from './components/SliderContext'
import { CssHandlesProvider } from './modules/cssHandles'

export const CSS_HANDLES = SliderCssHandles

interface Props {
  /** Used to override default CSS handles */
  classes?: CssHandlesTypes.CustomClasses<typeof CSS_HANDLES>
}

function SliderLayout({
  totalItems,
  infinite = false,
  showNavigationArrows = 'always',
  showPaginationDots = 'always',
  usePagination = true,
  fullWidth = true,
  arrowSize = 25,
  children,
  centerMode = 'disabled',
  centerModeSlidesGap,
  itemsPerPage = {
    desktop: 5,
    tablet: 3,
    phone: 1,
  },
  classes,
  ...contextProps
}: PropsWithChildren<SliderLayoutProps & SliderLayoutSiteEditorProps & Props>) {
  const { handles, withModifiers } = useCssHandles(CSS_HANDLES, { classes })
  const list = useListContext()?.list ?? []
  const images: React.ReactNodeArray = list as React.ReactNodeArray

  for (let i = images.length - 1; i >= 0; i--) {
    const image = images[i] as React.ReactElement

    const startDate = new Date(image.props.initialDatetime).getTime()
    const endDate = new Date(image.props.finishDatetime).getTime()
    const dateNow = new Date().getTime()

    if (dateNow <= startDate || dateNow >= endDate) {
      list?.splice(i, 1)
    }
  }

  const totalSlides = totalItems ?? React.Children.count(children) + list.length
  const responsiveArrowIconSize = useResponsiveValue(arrowSize)
  const responsiveItemsPerPage = useResponsiveValue(itemsPerPage)
  const responsiveCenterMode = useResponsiveValue(centerMode)
  const slides = React.Children.toArray(children).concat(list)

  // Force fullWidth mode when centerMode is on
  const resolvedFullWidth = fullWidth || responsiveCenterMode !== 'disabled'

  console.log("🚀 ~ file: SliderLayout.tsx:69 ~ slides:", slides, list)
  return (
    <CssHandlesProvider handles={handles} withModifiers={withModifiers}>
      <SliderContextProvider
        infinite={infinite}
        totalItems={totalSlides}
        itemsPerPage={responsiveItemsPerPage}
        centerMode={responsiveCenterMode}
        centerModeSlidesGap={centerModeSlidesGap}
        {...contextProps}
      >
        <Slider
          centerMode={responsiveCenterMode}
          centerModeSlidesGap={centerModeSlidesGap}
          infinite={infinite}
          showNavigationArrows={showNavigationArrows}
          showPaginationDots={showPaginationDots}
          totalItems={totalSlides}
          usePagination={usePagination}
          fullWidth={resolvedFullWidth}
          arrowSize={responsiveArrowIconSize}
          itemsPerPage={responsiveItemsPerPage}
        >
          {slides}
        </Slider>
      </SliderContextProvider>
    </CssHandlesProvider>
  )
}

const messages = defineMessages({
  sliderTitle: {
    id: 'admin/editor.main-layout.title',
    defaultMessage: '',
  },
  sliderInfinite: {
    id: 'admin/editor.main-layout.infinite',
    defaultMessage: '',
  },
  sliderShowNavigation: {
    id: 'admin/editor.main-layout.showNavigation',
    defaultMessage: '',
  },
  sliderShowPaginationDots: {
    id: 'admin/editor.main-layout.showPaginationDots',
    defaultMessage: '',
  },
  sliderUsePagination: {
    id: 'admin/editor.main-layout.usePagination',
    defaultMessage: '',
  },
  sliderFullWidth: {
    id: 'admin/editor.main-layout.sliderFullWidth',
    defaultMessage: '',
  },
  sliderFullWidthDescription: {
    id: 'admin/editor.main-layout.sliderFullWidthDescription',
    defaultMessage: '',
  },
})

SliderLayout.schema = {
  title: messages.sliderTitle.id,
  type: 'object',
  properties: {
    autoplay: {
      type: 'object',
      isLayout: true,
      properties: {
        timeout: {
          type: 'number',
        },
        stopOnHover: {
          type: 'boolean',
        },
      },
    },
    itemsPerPage: {
      type: 'object',
      isLayout: true,
      properties: {
        desktop: {
          default: 5,
          type: 'number',
        },
        tablet: {
          default: 3,
          type: 'number',
        },
        phone: {
          default: 1,
          type: 'number',
        },
      },
    },
  },
}

export default SliderLayout
