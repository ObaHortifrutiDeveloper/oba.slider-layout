import { useState } from 'react'
import { useSliderControls } from './useSliderControls'
import {
  SliderLayoutProps,
  useSliderDispatch,
  useSliderState,
} from '../components/SliderContext'

const SWIPE_THRESHOLD = 75
const TOUCH_MOVE_DAMPING = 25

export const useTouchHandlers = ({
  infinite,
  centerMode,
}: {
  infinite: boolean
  centerMode: SliderLayoutProps['centerMode']
}) => {
  const dispatch = useSliderDispatch()
  const { transform } = useSliderState()
  const { goForward, goBack } = useSliderControls(infinite)

  const [touchState, setTouchState] = useState({
    touchStartX: 0,
    touchStartY: 0,
    touchInitialTransform: transform,
    isVerticalScroll: undefined as boolean | undefined,
  })

  const onTouchStart = (e: React.TouchEvent) => {
    const startX = e.touches[0].clientX
    const startY = e.touches[0].clientY

    setTouchState({
      touchStartX: startX,
      touchStartY: startY,
      touchInitialTransform: transform,
      isVerticalScroll: undefined,
    })
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const xDiff = touchState.touchStartX - currentX
    const yDiff = touchState.touchStartY - currentY

    if (touchState.isVerticalScroll === undefined) {
      const isVertical = Math.abs(yDiff) > Math.abs(xDiff)
      setTouchState(prevState => ({
        ...prevState,
        isVerticalScroll: isVertical,
      }))
      if (isVertical) {
        return
      }
    }

    if (touchState.isVerticalScroll) {
      return
    }

    const touchMoveDelta = currentX - touchState.touchStartX
    const newTransform = touchState.touchInitialTransform + touchMoveDelta / ((centerMode !== 'disabled' ? 2 : 1) * TOUCH_MOVE_DAMPING)

    dispatch({
      type: 'TOUCH',
      payload: { transform: newTransform, isOnTouchMove: true },
    })

    e.preventDefault()
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchState.isVerticalScroll) {
      return
    }

    const endX = e.changedTouches[0].clientX
    const delta = endX - touchState.touchStartX

    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta > 0) {
        goBack()
      }

      if (delta < 0) {
        goForward()
      }
    } else {
      dispatch({
        type: 'TOUCH',
        payload: {
          transform: touchState.touchInitialTransform,
          isOnTouchMove: false,
        },
      })
    }

    setTouchState({ touchStartX: 0, touchStartY: 0, touchInitialTransform: transform, isVerticalScroll: undefined })
    dispatch({
      type: 'TOUCH',
      payload: {
        isOnTouchMove: false,
      },
    })
  }

  return { onTouchEnd, onTouchStart, onTouchMove }
}
