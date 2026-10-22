import { Grid } from 'antd'

const useBreakpoint = Grid.useBreakpoint
const useResponsiveLayout = () => {
  const screens = useBreakpoint()

  return {
    isXs: screens.xs,
    isSm: screens.sm,
    isMd: screens.md,
    isLg: screens.lg,
    isXl: screens.xl,
    isXxl: screens.xxl,
  }
}

export default useResponsiveLayout
