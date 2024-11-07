import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from "react-router-dom";
import { IonButton } from "@ionic/react";
import { useAuthService } from "@/services/auth";
import { buildErrorMessage } from "@/services/utils/format.tsx";
import { Input, InputValue } from "@/components/form/inputs/input.tsx";
import { OsmoseBarComponent } from "@/view/global-components/osmose-bar/osmose-bar.component.tsx";
import { InputRef } from "@/components/form/inputs/utils.ts";


export const Login: React.FC = () => {
  const [ error, setError ] = useState<string | undefined>();
  const [ isSubmitting, setIsSubmitting ] = useState<boolean>(false);

  const auth = useAuthService();
  const history = useHistory();
  const location = useLocation<any>();
  const { from } = location.state || { from: { pathname: '/annotation-campaign' } };
  const inputsRef = useRef<{ [key in 'username' | 'password']: InputRef<InputValue> | null }>({
    username: null,
    password: null
  });

  useEffect(() => {
    if (auth.isConnected()) history.replace(from);

    // Abort calls on view leave
    return () => auth.abort();
  }, []);

  useCallback(() => {
    if (auth.isConnected()) history.replace(from);
  }, [ auth.bearer ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const username = inputsRef.current.username?.validate()?.toString().trim();
    if (!username) {
      inputsRef.current.username?.setError("This field is required.")
    }
    const password = inputsRef.current.password?.validate()?.toString().trim();
    if (!username) {
      inputsRef.current.username?.setError("This field is required.")
    }
    if (!username || !password) return ;
    setError(undefined);

    try {
      setIsSubmitting(true)
      await auth.login(username, password);
      history.replace(from);
    } catch (e: any) {
      setError(buildErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="row text-left h-100 main">
        <div className="col-sm-12 border rounded">
          <h1 className="text-center">Login</h1>
          { error && <p className="error-message">{ error }</p> }
          <form onSubmit={ handleSubmit }>
            <div className="form-group">
              <Input id="loginInput" className="form-control"
                     ref={ el => inputsRef.current.username = el }
                     placeholder="username" label="Login" autoComplete="username"/>
            </div>
            <div className="form-group">
              <Input id="passwordInput" className="form-control" ref={ el => inputsRef.current.password = el }
                     placeholder="password" label="Password"
                     type="password" autoComplete="current-password"/>
            </div>

            <IonButton color={ "primary" }
                       disabled={ isSubmitting }
                       type={ "submit" }>
              Submit
            </IonButton>
          </form>
        </div>
      </div>

      <Link to="/">Back to Home</Link>

      <OsmoseBarComponent/>
    </div>
  )
}

