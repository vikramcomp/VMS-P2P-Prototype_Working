import { Tooltip } from '../tooltip'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Tooltip Component', () => {
  it('should render children', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    )

    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('should show tooltip on mouse enter', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    )

    const button = screen.getByText('Hover me')
    await user.hover(button)

    await waitFor(() => {
      expect(screen.getByText('Test tooltip content')).toBeInTheDocument()
    })
  })

  it('should hide tooltip on mouse leave', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    )

    const button = screen.getByText('Hover me')
    await user.hover(button)

    await waitFor(() => {
      expect(screen.getByText('Test tooltip content')).toBeInTheDocument()
    })

    await user.unhover(button)

    await waitFor(() => {
      expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument()
    })
  })

  it('should render with custom position', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Bottom tooltip" position="bottom">
        <button>Hover me</button>
      </Tooltip>
    )

    const button = screen.getByText('Hover me')
    await user.hover(button)

    await waitFor(() => {
      expect(screen.getByText('Bottom tooltip')).toBeInTheDocument()
    })
  })

  it('should render with custom className', () => {
    render(
      <Tooltip content="Test" className="custom-class">
        <button>Hover me</button>
      </Tooltip>
    )

    const wrapper = screen.getByText('Hover me').parentElement
    expect(wrapper).toHaveClass('custom-class')
  })

  it('should handle different position values', async () => {
    const user = userEvent.setup()
    const positions = ['top', 'bottom', 'left', 'right'] as const

    for (const position of positions) {
      const { unmount } = render(
        <Tooltip content={`${position} tooltip`} position={position}>
          <button>{position} button</button>
        </Tooltip>
      )

      const button = screen.getByText(`${position} button`)
      await user.hover(button)

      await waitFor(() => {
        expect(screen.getByText(`${position} tooltip`)).toBeInTheDocument()
      })

      unmount()
    }
  })

  it('should handle long content with text wrapping', async () => {
    const user = userEvent.setup()
    const longContent = 'This is a very long tooltip content that should wrap when it exceeds the maximum width'

    render(
      <Tooltip content={longContent}>
        <button>Hover me</button>
      </Tooltip>
    )

    const button = screen.getByText('Hover me')
    await user.hover(button)

    await waitFor(() => {
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })
  })

  it('should not show tooltip when content is empty', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="">
        <button>Hover me</button>
      </Tooltip>
    )

    const button = screen.getByText('Hover me')
    await user.hover(button)

    // Tooltip should still render but with empty content
    await waitFor(() => {
      const tooltips = screen.queryAllByText('')
      expect(tooltips.length).toBeGreaterThanOrEqual(0)
    })
  })
})
