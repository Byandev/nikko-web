import { useVuelidate } from "@vuelidate/core";

export function useValidation(formValues: any, validationRules: any) {
  const formRef = ref(formValues);
  const v$ = useVuelidate(validationRules, formRef);

  return { formRef, v$ };
}
