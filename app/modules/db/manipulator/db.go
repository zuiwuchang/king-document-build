package manipulator

import (
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"github.com/go-xorm/xorm"
	"github.com/revel/revel"
	"io/ioutil"
	"king-document-build/app/modules/db/data"
	"strings"
	"time"
)

var g_engine *xorm.Engine
var g_RootPath string
var g_Pwd string
var g_License string

func GetLicense() string {
	return g_License
}
func GetRootPath() string {
	return g_RootPath
}
func GetPwd() string {
	return g_Pwd
}
func Initialize() {
	b, e := ioutil.ReadFile(revel.BasePath + "/" + "LICENSE")
	if e != nil {
		panic(e)
	}
	g_License = string(b)

	//get configure
	g_RootPath, _ = revel.Config.String("path.root")
	if g_RootPath == "" {
		g_RootPath = revel.BasePath + "/document"
	} else if !strings.HasPrefix(g_RootPath, "/") {
		g_RootPath = revel.BasePath + "/" + g_RootPath
	}
	g_Pwd, _ = revel.Config.String("safe.pwd")
	g_Pwd = strings.TrimSpace(g_Pwd)
	if g_Pwd != "" {
		sha := sha512.New()
		sha.Write([]byte(g_Pwd))
		g_Pwd = hex.EncodeToString(sha.Sum(nil))
		revel.INFO.Println("pwd =", g_Pwd)
	}

	driver, _ := revel.Config.String("db.driver")
	if driver == "" {
		panic("db.driver not configure at  app.conf")
	}
	source, _ := revel.Config.String("db.source")
	if source == "" {
		panic("db.source not configure at app.conf")
	}
	cache, _ := revel.Config.Int("db.cache")
	if driver == "sqlite3" {
		if !strings.HasPrefix(source, "/") {
			source = GetRootPath() + "/" + source
			fmt.Println("*** sqlite3", source)
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
	//cache
	if cache > 0 {
		store := xorm.NewMemoryStore()
		cacher := xorm.NewLRUCacher(store, cache)
		g_engine.SetDefaultCacher(cacher)
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
	initTable(data.Chapter{})
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
	} else {
		if err = g_engine.Sync2(bean); err != nil {
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
