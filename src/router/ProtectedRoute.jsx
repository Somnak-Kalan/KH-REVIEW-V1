import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import httpCommon from 'utils/http-common.js'

import {
  AuthContext,
} from 'contexts/AuthContext'


const ProtectedRoute = ({
  children,
}) => {
  const {
    setAccessTokenFn,
    removeToken,
    access_token,
  } = useContext(
    AuthContext
  )


  /* =========================================================
     ROUTER
  ========================================================= */

  const location =
    useLocation()

  const navigate =
    useNavigate()


  /* =========================================================
     TOKEN
  ========================================================= */

  const token =
    access_token ||
    localStorage.getItem(
      'token'
    ) ||
    ''


  /* =========================================================
     AUTH CHECKING
  ========================================================= */

  const [
    checkingInitialAuth,
    setCheckingInitialAuth,
  ] = useState(
    Boolean(token)
  )


  /* =========================================================
     REFS
  ========================================================= */

  const initialCheckFinishedRef =
    useRef(false)

  const checkedRouteRef =
    useRef('')

  const latestPathRef =
    useRef('')


  latestPathRef.current =
    `${location.pathname}${location.search}`


  /* =========================================================
     REFRESH TOKEN
  ========================================================= */

  useEffect(() => {
    let isCancelled =
      false


    const refreshToken =
      async () => {
        /* ===================================================
           NO TOKEN
        =================================================== */

        if (!token) {
          if (
            !isCancelled
          ) {
            setCheckingInitialAuth(
              false
            )
          }

          return
        }


        /* ===================================================
           CURRENT ROUTE
        =================================================== */

        const routeKey =
          location.key ||
          `${location.pathname}${location.search}`                                                                                                                                                                                                                    


        /* ===================================================
           ALREADY CHECKED
        =================================================== */

        if (
          checkedRouteRef
            .current ===
          routeKey
        ) {
          return
        }


        checkedRouteRef.current =
          routeKey


        /* ===================================================
           INITIAL AUTH CHECK
        =================================================== */

        const isInitialCheck =
          !initialCheckFinishedRef
            .current


        if (
          isInitialCheck &&
          !isCancelled
        ) {
          setCheckingInitialAuth(
            true
          )
        }


        /* ===================================================
           REFRESH TOKEN REQUEST
        =================================================== */

        try {
          const response =
            await httpCommon.get(
              '/admin/refresh_token',
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            )


          if (
            isCancelled
          ) {
            return
          }


          const newToken =
            response?.data
              ?.accessToken


          /* =================================================
             SAVE NEW TOKEN
          ================================================= */

          if (
            newToken &&
            newToken !==
            token
          ) {
            setAccessTokenFn(
              newToken
            )

            localStorage.setItem(
              'token',
              newToken
            )
          }

        } catch (error) {
          /* =================================================
             CANCELLED
          ================================================= */

          if (
            isCancelled
          ) {
            return
          }


          /* =================================================
             RESET CHECKED ROUTE
          ================================================= */

          checkedRouteRef.current =
            ''


          /* =================================================
             REMOVE INVALID TOKEN
          ================================================= */

          removeToken()


          /* =================================================
             REDIRECT LOGIN
          ================================================= */

          navigate(
            '/login',
            {
              replace:
                true,

              state: {
                from:
                  latestPathRef
                    .current,
              },
            }
          )

        } finally {
          /* =================================================
             FINISH CHECK
          ================================================= */

          if (
            !isCancelled
          ) {
            initialCheckFinishedRef.current =
              true

            setCheckingInitialAuth(
              false
            )
          }
        }
      }


    refreshToken()


    /* =======================================================
       CLEANUP
    ======================================================= */

    return () => {
      isCancelled =
        true
    }

  }, [
    location.key,
    location.pathname,
    location.search,
    token,
    navigate,
    removeToken,
    setAccessTokenFn,
  ])


  /* =========================================================
     NO TOKEN -> LOGIN
  ========================================================= */

  if (
    !token
  ) {
    return (
      <Navigate
        to='/login'
        replace
        state={{
          from:
            `${location.pathname}${location.search}`,
        }}
      />
    )
  }


  /* =========================================================
     WAIT AUTH CHECK

     NO LOADER HERE
     YOUR ROUTE/SUSPENSE FILE HANDLES LOADING UI
  ========================================================= */

  if (
    checkingInitialAuth
  ) {
    return null
  }


  /* =========================================================
     AUTHENTICATED
  ========================================================= */

  return (
    <>
      {children}
    </>
  )
}


export default ProtectedRoute
