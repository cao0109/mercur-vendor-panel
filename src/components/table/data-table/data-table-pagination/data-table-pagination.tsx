import { Input, Table } from "@medusajs/ui";
import {
  ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useState
} from "react";
import { useTranslation } from "react-i18next";

type PaginationProps = Omit<
  ComponentPropsWithoutRef<typeof Table.Pagination>,
  "translations"
> & {
  onPageChange: (page: number) => void, // 添加页码变更回调
  showJumpTo?:boolean
};

export const Pagination = (props: PaginationProps) => {
  const { t } = useTranslation();
  const { pageIndex, pageCount, onPageChange, showJumpTo } = props;
  const [targetPage, setTargetPage] = useState('');
  
  // 当外部页码变化时，同步输入框值
  useEffect(() => {
    setTargetPage((pageIndex + 1).toString());
  }, [pageIndex]);
  
  // 处理页码跳转
  const handleJump = useCallback(() => {
    if (!targetPage) return;
    
    const pageNum = parseInt(targetPage, 10);
    
    // 验证输入是否为有效页码
    if (isNaN(pageNum)) {
      setTargetPage((pageIndex + 1).toString());
      return;
    }
    
    // 确保页码在有效范围内（1-based）
    const validPage = Math.max(1, Math.min(pageNum, pageCount));
    
    // 如果页码有效且与当前页不同，则触发变更
    if (validPage !== pageIndex + 1) {
      onPageChange(validPage - 1);
    }
    
    // 重置输入框
    setTargetPage(validPage.toString());
  }, [targetPage, pageIndex, pageCount, onPageChange]);
  
  // 处理输入变化
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '' || /^\d+$/.test(value)) {
      setTargetPage(value);
    }
  }, []);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  }, [handleJump]);
  
  const handleBlur = useCallback(() => {
    if (targetPage) { 
      handleJump();
    }
  }, [handleJump, targetPage]);
  
  const translations = {
    of: t("general.of"),
    results: t("general.results"),
    pages: t("general.pages"),
    prev: t("general.prev"),
    next: t("general.next"),
  };

  return (
    <div className="flex items-center justify-between w-full py-3 relative">
      {/* 原生分页组件 */}
      <Table.Pagination
        className="flex-shrink-0"
        {...props}
        translations={translations}
      />
      
      {/* 跳转功能  */}
      {
         showJumpTo && <div className="flex items-center space-x-2 ml-auto" style={{position: 'absolute', right: '300px', top: '30px'}}>
         <span className="text-sm">{t("app.table.jumpTo")}</span>
         <Input
           className="w-16 text-center h-7"
           value={targetPage}
           onChange={handleChange}
           onKeyDown={handleKeyDown}
           onBlur={handleBlur}
           type="number"
           min={1}
           max={pageCount}
         />
         <span className="text-sm">{t("app.table.page")}</span>
       </div>
      }
    </div>
  );
};