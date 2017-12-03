package app

import (
	"errors"
	_ "github.com/denisenkom/go-mssqldb"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"
	"github.com/revel/revel"
	"king-document-build/app/controllers"
	"king-document-build/app/modules/db/manipulator"
	"strings"
)

func init() {
	// Filters is the default set of global filters.
	revel.Filters = []revel.Filter{
		revel.PanicFilter,             // Recover from panics and display an error page instead.
		revel.RouterFilter,            // Use the routing table to select the right Action
		revel.FilterConfiguringFilter, // A hook for adding or removing per-Action filters.
		revel.ParamsFilter,            // Parse parameters into Controller.Params.
		revel.SessionFilter,           // Restore and write the session cookie.
		revel.FlashFilter,             // Restore and write the flash cookie.
		revel.ValidationFilter,        // Restore kept validation errors and save new ones from cookie.
		revel.I18nFilter,              // Resolve the requested language
		func(c *revel.Controller, fc []revel.Filter) {
			locale := (c.ViewArgs[revel.CurrentLocaleViewArg]).(string)
			if locale != "zh-TW" &&
				locale != "en" {

				locale = strings.ToLower(locale)
				if strings.HasPrefix(locale, "en-") {
					locale = "en"
				} else {
					locale = "zh-TW"
				}

				c.Request.Locale = locale
				c.ViewArgs[revel.CurrentLocaleViewArg] = locale
			}
			fc[0](c, fc[1:])
		},
		HeaderFilter,            // Add some security based headers
		revel.InterceptorFilter, // Run interceptors around the action.
		revel.CompressFilter,    // Compress the result.
		revel.ActionInvoker,     // Invoke the action.
	}

	// register startup functions with OnAppStart
	// ( order dependent )
	// revel.OnAppStart(InitDB)
	// revel.OnAppStart(FillCache)
	revel.OnAppStart(func() {
		manipulator.Initialize()
		//Intercept
		if manipulator.GetPwd() != "" {
			revel.InterceptFunc(checkPwd, revel.BEFORE, &controllers.Chapter{})
			revel.InterceptFunc(checkPwd, revel.BEFORE, &controllers.Document{})
			revel.InterceptFunc(checkPwd, revel.BEFORE, &controllers.Offline{})
			revel.InterceptFunc(checkPwd, revel.BEFORE, &controllers.Panel{})
			revel.InterceptFunc(checkPwd, revel.BEFORE, &controllers.Section{})
			revel.InterceptFunc(checkPwd, revel.BEFORE, &controllers.Tag{})
			revel.InterceptFunc(checkPwd, revel.BEFORE, &controllers.App{})
			revel.InterceptFunc(checkPwd, revel.BEFORE, &controllers.Files{})

			g_Free = make(map[string]bool)
			g_Free["/index"] = true
			g_Free["/app/index"] = true

			g_Free["/login"] = true
			g_Free["/app/login"] = true

			g_Free["/dologin"] = true
			g_Free["/app/dologin"] = true

			g_Free["/out"] = true
			g_Free["/app/out"] = true

			g_Free["/search"] = true
			g_Free["/app/search"] = true

			g_Free["/tag/ajaxgetdocs"] = true
			g_Free["/document/index"] = true

			g_Free["/chapter"] = true
			g_Free["/section/ajaxfind"] = true

		}
	})

}

// TODO turn this into revel.HeaderFilter
// should probably also have a filter for CSRF
// not sure if it can go in the same filter or not
var HeaderFilter = func(c *revel.Controller, fc []revel.Filter) {
	// Add some common security headers
	c.Response.Out.Header().Add("X-Frame-Options", "SAMEORIGIN")
	c.Response.Out.Header().Add("X-XSS-Protection", "1; mode=block")
	c.Response.Out.Header().Add("X-Content-Type-Options", "nosniff")

	fc[0](c, fc[1:]) // Execute the next filter stage.
}

var g_Free map[string]bool

func checkPwd(c *revel.Controller) revel.Result {
	key := c.Request.URL.Path
	if key == "/" {
		return nil
	} else if strings.HasSuffix(key, "/") {
		key = key[:len(key)-1]
	} else {
		key = strings.ToLower(key)
	}

	if _, ok := g_Free[key]; ok {
		return nil
	}
	if pwd, ok := c.Session["pwd"]; !ok || pwd != manipulator.GetPwd() {
		return c.RenderError(errors.New(c.Message("Permission denied")))
	}
	return nil
}
