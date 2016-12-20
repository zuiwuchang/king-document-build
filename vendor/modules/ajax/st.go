package ajax

import (
	"modules/db/data"
)

const (
	//執行成功
	CODE_SUCCESS = 0

	//沒有權限
	CODE_PERMISSION_DENIED = 1

	//錯誤
	CODE_ERROR = 2
)

type Result struct {
	Code  int64  //錯誤碼 爲0 成功
	Emsg  string //錯誤描述
	Value int64  //int64 返回值
	Str   string //string 返回值
}

type ResultDocs struct {
	Result
	Data []data.Document
}
type ResultSections struct {
	Result
	Data []data.Section
}
