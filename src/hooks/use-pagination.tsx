import { useMemo, useState } from "react"

interface TablePaginationProps {
  count: number
  pageSize: number
  pageIndex: number
  pageCount: number
  canPreviousPage: boolean
  canNextPage: boolean
  previousPage: () => void
  nextPage: () => void
}
export default function usePagination<T>(
  totalData: T[],
  pageSize: number = 20
): TablePaginationProps & { currentOrders: T[] } {
  const [currentPage, setCurrentPage] = useState(0)
  const count = totalData.length
  const pageCount = Math.ceil(totalData.length / pageSize)
  const canNextPage = useMemo(
    () => currentPage < pageCount - 1,
    [currentPage, pageCount]
  )
  const canPreviousPage = useMemo(() => currentPage - 1 >= 0, [currentPage])

  const nextPage = () => {
    if (canNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const previousPage = () => {
    if (canPreviousPage) {
      setCurrentPage(currentPage - 1)
    }
  }
  const currentOrders: T[] = useMemo(() => {
    const offset = currentPage * pageSize
    const limit = Math.min(offset + pageSize, totalData.length)

    return totalData.slice(offset, limit)
  }, [currentPage, pageSize, totalData])

  return {
    currentOrders,
    count,
    pageCount,
    pageIndex: currentPage,
    pageSize,
    canNextPage,
    canPreviousPage,
    nextPage,
    previousPage,
  }
}
