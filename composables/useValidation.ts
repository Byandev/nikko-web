import { useVuelidate } from "@vuelidate/core";
import type {FormErrorsType} from "~/types/api/response/error";

export function useValidation(formValues: any, validationRules: any) {
  const formRef = ref(formValues);
  const $externalResults = ref<FormErrorsType>({});


  const v$ = useVuelidate(validationRules, formRef, { $externalResults });

  return { formRef, v$, $externalResults };
}
