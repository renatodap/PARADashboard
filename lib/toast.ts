import toast from 'react-hot-toast'

export const showToast = {
  success: (message: string) => {
    toast.success(message)
  },
  error: (message: string) => {
    toast.error(message)
  },
  loading: (message: string) => {
    return toast.loading(message)
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, messages)
  },
}

// API error handler
export function handleApiError(error: any, fallbackMessage = 'Something went wrong') {
  const message = error?.response?.data?.message || error?.message || fallbackMessage
  showToast.error(message)
  console.error('API Error:', error)
}
