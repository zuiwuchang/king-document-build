package manipulator

import (
	_ "github.com/denisenkom/go-mssqldb"
	_ "github.com/go-sql-driver/mysql"
	//_ "github.com/mattn/go-sqlite3"
	"github.com/go-xorm/xorm"
	"github.com/revel/revel"
	"king-document-build/app/modules/db/data"
	"strings"
	"time"
)

var g_engine *xorm.Engine
var g_mediaRoot string

func Initialize() {

	//get configure
	driver, _ := revel.Config.String("db.driver")
	if driver == "" {
		panic("db.driver not configure at  app.conf")
	}
	source, _ := revel.Config.String("db.source")
	if source == "" {
		panic("db.source not configure at app.conf")
	}
	if driver == "sqlite3" {
		if !strings.HasPrefix(source, "/") {
			source = revel.BasePath + "/private/" + source
		}
	}

	//create engine
	var err error
	g_engine, err = xorm.NewEngine(driver, source)
	if err != nil {
		panic(err)
	}
	if err = g_engine.Ping(); err != nil {
		panic(err)
	}

	//show sql
	showsql, _ := revel.Config.String("db.showsql")
	showsql = strings.ToLower(showsql)
	if showsql != "" && showsql != "0" && showsql != "false" {
		g_engine.ShowSQL(true)
	}

	//keep live
	interval, _ := revel.Config.Int("db.keeplive")
	if interval < 10 {
		interval = 60
	}
	go func(interval int) {

		for {
			time.Sleep(time.Minute * time.Duration(interval))
			g_engine.Ping()
		}
	}(interval)

	//init db
	initTable(data.Tag{})
	initTable(data.Document{})
	initTable(data.Panel{})
	initTable(data.Section{})

}
func initTable(bean interface{}) {
	if has, err := g_engine.IsTableExist(bean); err != nil {
		panic(err)
	} else if !has {
		if err = g_engine.CreateTables(bean); err != nil {
			panic(err)
		}

		if err = g_engine.CreateUniques(bean); err != nil {
			panic(err)
		}
		if err = g_engine.CreateIndexes(bean); err != nil {
			panic(err)
		}
	}
}
func GetEngine() *xorm.Engine {
	return g_engine
}
func NewSession() *xorm.Session {
	return g_engine.NewSession()
}
