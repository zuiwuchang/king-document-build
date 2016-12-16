package data

type Tag struct {
	//唯一標識
	Id int64
	//父節點 根節點 pid == 0
	Pid int64 `xorm:"index"`

	//標籤名
	Name string

	//同級 標籤 顯示 順序
	Sort int64

	//標籤下 檔案數量
	Docs int64
}
