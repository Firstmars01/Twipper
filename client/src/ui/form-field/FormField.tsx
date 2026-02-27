import { Box, Input, Text } from "@chakra-ui/react";

interface FormFieldProps {
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function FormField({ placeholder, type = "text", value, onChange, error }: FormFieldProps) {
  return (
    <Box width="100%">
      <Input
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        borderColor={error ? "red.500" : undefined}
      />
      {error && (
        <Text color="red.500" fontSize="xs" mt={1}>{error}</Text>
      )}
    </Box>
  );
}

export default FormField;
