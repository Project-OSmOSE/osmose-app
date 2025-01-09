import React, { useEffect, useState } from "react";
import { useGetCurrentUserQuery, useUpdatePasswordMutation } from "@/service/user";
import styles from './auth.module.scss'
import { FadedText, WarningText } from "@/components/ui";
import { IonButton, IonSpinner } from "@ionic/react";
import { getErrorMessage } from "@/service/function.ts";
import { FormBloc, Input } from "@/components/form";
import { useToast } from "@/services/utils/toast.ts";

export const Account: React.FC = () => {
  const { data: currentUser, isLoading, error } = useGetCurrentUserQuery();
  const [ updatePassword, {
    isLoading: isSubmittingPassword,
    error: passwordError,
    isSuccess: isPasswordUpdateSuccessful
  } ] = useUpdatePasswordMutation();

  const toast = useToast();

  const [ oldPassword, setOldPassword ] = useState<string>('');
  const [ newPassword, setNewPassword ] = useState<string>('');
  const [ newPasswordConfirm, setNewPasswordConfirm ] = useState<string>('');

  const [ errors, setErrors ] = useState<{new_password?: string[], old_password?: string[]}>({});

  useEffect(() => {
    return () => {
      toast.dismiss()
    }
  }, []);

  useEffect(() => {
    if (passwordError) {
      const e = getErrorMessage(passwordError);
      if (!e) return;
      try {
        toast.presentError(e)
        setErrors(JSON.parse(e))
      }
      catch { /* empty */ }
    }
  }, [ passwordError ]);

  useEffect(() => {
    if (isPasswordUpdateSuccessful) {
      toast.presentSuccess('You password have been changed')
      setOldPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
    }
  }, [ isPasswordUpdateSuccessful ]);

  function submitPassword() {
    setErrors({})
    updatePassword({
      oldPassword,
      newPassword
    })
  }

  return (
    <div className={ styles.loggedInPage }>
      <h2>Account</h2>

      { isLoading && <IonSpinner/> }
      { error && <WarningText>{ getErrorMessage(error) }</WarningText> }

      { currentUser && <div className={ styles.content }>
          <FormBloc>
              <div>
                  <FadedText>Username</FadedText>
                  <p>{ currentUser.username }</p>
              </div>
              <div>
                  <FadedText>Email</FadedText>
                  <p>{ currentUser.email }</p>
              </div>
          </FormBloc>

          <FormBloc label='Update password'>
              <Input value={ oldPassword }
                     onChange={ e => setOldPassword(e.target.value) }
                     error={ errors?.old_password?.join(' ') }
                     placeholder="password"
                     label="Old password"
                     type="password"
                     autoComplete="current-password"/>

              <Input value={ newPassword }
                     onChange={ e => setNewPassword(e.target.value) }
                     error={ errors?.new_password?.join(' ') }
                     placeholder="password"
                     label="New password"
                     type="password"
                     autoComplete="new-password"/>

              <Input value={ newPasswordConfirm }
                     onChange={ e => setNewPasswordConfirm(e.target.value) }
                     error={ newPasswordConfirm !== newPassword ? 'The password are different' : undefined }
                     placeholder="password"
                     label="Confirm new password"
                     type="password"
                     autoComplete="new-password"/>

              <IonButton className={ styles.submit }
                         disabled={ !oldPassword || !newPassword || !newPasswordConfirm || isSubmittingPassword }
                         onClick={ submitPassword }>
                  Update
                { isSubmittingPassword && <IonSpinner slot='end'/> }
              </IonButton>
          </FormBloc>
      </div> }
    </div>
  )
}