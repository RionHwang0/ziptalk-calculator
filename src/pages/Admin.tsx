import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export default function Admin() {
  const [competitionData, setCompetitionData] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("apartments");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Fetch apartments from database
  const { data: apartments, isLoading: isLoadingApartments } = useQuery({
    queryKey: ['/api/apartments'],
    refetchOnWindowFocus: false
  });

  // Fetch competition data from database
  const { data: competitionDataList, isLoading: isLoadingCompetitionData } = useQuery({
    queryKey: ['/api/competition-data/all'],
    refetchOnWindowFocus: false
  });

  // Delete apartment mutation
  const deleteApartmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/apartments/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/apartments'] });
      toast({
        title: "아파트 삭제 완료",
        description: "아파트 정보가 성공적으로 삭제되었습니다.",
      });
    }
  });

  // Upload competition data mutation
  const uploadDataMutation = useMutation({
    mutationFn: async (data: any[]) => {
      return await apiRequest('/api/competition-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competition-data/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/apartments'] });
      toast({
        title: "경쟁률 데이터 업로드 완료",
        description: "데이터가 성공적으로 업로드되었습니다.",
      });
      setShowUploadDialog(false);
      setCompetitionData(null);
      setExcelData([]);
    }
  });

  // Delete competition data mutation
  const deleteCompetitionDataMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/competition-data/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competition-data/all'] });
      toast({
        title: "경쟁률 데이터 삭제 완료",
        description: "경쟁률 데이터가 성공적으로 삭제되었습니다.",
      });
    }
  });

  // Download template Excel file
  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/competition-data/template');
      if (!response.ok) throw new Error('Template download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '청약_경쟁률_데이터_템플릿.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "템플릿 다운로드 실패",
        description: "템플릿 파일을 다운로드하는데 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCompetitionData(e.target.files[0]);
      
      // Read the Excel file
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target && evt.target.result) {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          setExcelData(data);
        }
      };
      reader.readAsBinaryString(e.target.files[0]);
    }
  };

  // Handle upload
  const handleUpload = () => {
    if (excelData.length === 0) {
      toast({
        title: "업로드 실패",
        description: "유효한 Excel 데이터가 없습니다.",
        variant: "destructive"
      });
      return;
    }
    
    uploadDataMutation.mutate(excelData);
  };

  // Handle delete apartment
  const handleDeleteApartment = (id: number) => {
    if (confirm("이 아파트를 삭제하시겠습니까?")) {
      deleteApartmentMutation.mutate(id);
    }
  };

  // Handle delete competition data
  const handleDeleteCompetitionData = (id: number) => {
    if (confirm("이 경쟁률 데이터를 삭제하시겠습니까?")) {
      deleteCompetitionDataMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">청약 데이터 관리자 페이지</h1>
        <Link href="/">
          <Button variant="outline">메인으로 돌아가기</Button>
        </Link>
      </div>
      
      <Tabs defaultValue="apartments" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="apartments">아파트 관리</TabsTrigger>
          <TabsTrigger value="competition-data">경쟁률 데이터 관리</TabsTrigger>
        </TabsList>
        
        {/* Apartments Tab */}
        <TabsContent value="apartments">
          <Card>
            <CardHeader>
              <CardTitle>아파트 목록</CardTitle>
              <CardDescription>
                등록된 아파트 정보를 조회하고 관리할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingApartments ? (
                <div className="flex justify-center py-10">로딩 중...</div>
              ) : !apartments || apartments.length === 0 ? (
                <div className="text-center py-10">
                  <p>등록된 아파트 정보가 없습니다.</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>아파트명</TableHead>
                        <TableHead>위치</TableHead>
                        <TableHead>경쟁률</TableHead>
                        <TableHead>최저점수</TableHead>
                        <TableHead>평균점수</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apartments.map((apt: any) => (
                        <TableRow key={apt.id}>
                          <TableCell>{apt.id}</TableCell>
                          <TableCell>{apt.name}</TableCell>
                          <TableCell>{apt.location}</TableCell>
                          <TableCell>{apt.competitionRate}:1</TableCell>
                          <TableCell>{apt.minScore}</TableCell>
                          <TableCell>{apt.avgScore || apt.requiredScore}</TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteApartment(apt.id)}
                            >
                              삭제
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Competition Data Tab */}
        <TabsContent value="competition-data">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>경쟁률 데이터 관리</CardTitle>
                <CardDescription>
                  청약 경쟁률 데이터를 업로드하고 관리할 수 있습니다.
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button onClick={downloadTemplate}>
                  템플릿 다운로드
                </Button>
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button>데이터 업로드</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>경쟁률 데이터 업로드</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Excel 파일 선택</label>
                        <Input
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={handleFileChange}
                        />
                      </div>
                      
                      {excelData.length > 0 && (
                        <div>
                          <p className="text-sm mb-2">미리보기 ({excelData.length}개 항목):</p>
                          <ScrollArea className="h-[200px] border rounded-md p-2">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {Object.keys(excelData[0]).map((key) => (
                                    <TableHead key={key}>{key}</TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {excelData.slice(0, 5).map((row, index) => (
                                  <TableRow key={index}>
                                    {Object.values(row).map((value: any, i) => (
                                      <TableCell key={i}>{value}</TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleUpload} 
                        disabled={!competitionData || uploadDataMutation.isPending}
                      >
                        {uploadDataMutation.isPending ? "업로드 중..." : "업로드"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCompetitionData ? (
                <div className="flex justify-center py-10">로딩 중...</div>
              ) : !competitionDataList || competitionDataList.length === 0 ? (
                <div className="text-center py-10">
                  <p>업로드된 경쟁률 데이터가 없습니다.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>파일명</TableHead>
                        <TableHead>업로드 날짜</TableHead>
                        <TableHead>항목 수</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitionDataList.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.fileName}</TableCell>
                          <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                          <TableCell>{Array.isArray(item.data) ? item.data.length : 0}</TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteCompetitionData(item.id)}
                            >
                              삭제
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}