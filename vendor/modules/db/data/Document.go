package data

//檔案
type Document struct {
	//唯一標識
	Id int64
	//標籤名
	Tag int64

	//檔案名
	Name string
}

//檔案 面板節點
type Panel struct {
	//唯一標識
	Id int64

	//所屬檔案 id
	Doc int64

	//面板名稱
	Name string

	//面板 顯示 順序
	Sort int
}

//面板 節點
type Section struct {
	//唯一標識
	Id int64

	//所屬面板 id
	Panel int64

	//節點名
	Name string

	//節點 顯示 順序
	Sort int
}
