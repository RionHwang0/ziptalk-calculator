import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileSpreadsheet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { apiRequest } from "@/lib/queryClient";

interface CompetitionRateUploadProps {
  onUpload: (data: any) => void;
}

export default function CompetitionRateUpload({ onUpload }: CompetitionRateUploadProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const selectedFile = e.target.files[0];
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast({
        title: "파일 형식 오류",
        description: "엑셀 파일(.xlsx 또는 .xls)만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Read and process Excel file
    try {
      const data = await readExcelFile(selectedFile);
      processExcelData(data);
    } catch (error) {
      toast({
        title: "파일 처리 오류",
        description: "엑셀 파일을 처리하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const processExcelData = async (data: any[]) => {
    setIsUploading(true);
    try {
      // Send data to backend for processing
      const response = await apiRequest('POST', '/api/competition-data', { data });
      const processedData = await response.json();
      onUpload(processedData);
      
      toast({
        title: "업로드 성공",
        description: "경쟁률 데이터가 성공적으로 업로드되었습니다.",
      });
    } catch (error) {
      toast({
        title: "업로드 실패",
        description: "서버 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    onUpload(null);
  };

  const downloadSampleTemplate = () => {
    window.location.href = '/api/competition-data/template';
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-2 mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <UploadCloud className="h-6 w-6 mr-2 text-[#FEE500]" />
          경쟁률 데이터 업로드
        </h2>
        
        {!file ? (
          <div className="border-2 border-dashed border-[#EAEBEE] rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <FileSpreadsheet className="h-16 w-16 text-[#EAEBEE] mb-4" />
              
              <h3 className="text-lg font-medium mb-2">경쟁률 데이터 업로드</h3>
              <p className="text-sm text-gray-500 mb-6">엑셀(.xlsx) 파일을 드래그하거나 클릭하여 업로드하세요</p>
              
              <label htmlFor="file-upload" className="cursor-pointer">
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileChange}
                />
                <Button 
                  variant="default" 
                  className="bg-[#3182F6] text-white font-medium rounded-lg hover:bg-blue-600"
                >
                  파일 선택하기
                </Button>
              </label>
              
              <Button 
                variant="link" 
                className="text-[#3182F6] text-sm hover:underline mt-4"
                onClick={downloadSampleTemplate}
              >
                샘플 템플릿 다운로드
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-[#F5F6F7] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileSpreadsheet className="h-6 w-6 text-[#3182F6] mr-2" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)}MB • 방금 전
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-500 hover:text-[#FF5252]"
                onClick={handleRemoveFile}
                disabled={isUploading}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
