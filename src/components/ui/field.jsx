import { Field as ChakraField } from '@chakra-ui/react'
import * as React from 'react'

export const Field = React.forwardRef(function Field(props, ref) {
  const { label, children, helperText, errorText, optionalText, ...rest } =
    props
  return (
    <ChakraField.Root ref={ref} {...rest}>
      {label && (
        <ChakraField.Label>
          {label}
          <ChakraField.RequiredIndicator fallback={optionalText} />
        </ChakraField.Label>
      )}
      {children}
      {helperText && (
        <ChakraField.HelperText>{helperText}</ChakraField.HelperText>
      )}
      {errorText && <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>}
    </ChakraField.Root>
  )
})

// Export the sub-components for direct usage
Field.Root = ChakraField.Root
Field.Label = ChakraField.Label
Field.ErrorText = ChakraField.ErrorText
Field.HelperText = ChakraField.HelperText
Field.RequiredIndicator = ChakraField.RequiredIndicator
