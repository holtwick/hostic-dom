# mod_rewrite

A loose collection of ideas for Apache configurations

- [Flags overview](http://httpd.apache.org/docs/current/mod/mod_rewrite.html#rewriteflags) and [details](http://httpd.apache.org/docs/current/rewrite/flags.html)
  - `last`

```

# If file exists, stop here -
RewriteCond "%{REQUEST_FILENAME}" "-f"
RewriteRule ^ %{REQUEST_FILENAME} [END]

RewriteCond "%{REQUEST_FILENAME}.html" "-f"
RewriteRule ^ %{REQUEST_FILENAME}.html [END]
# - end

# If any supported language prefix is used use it -
RewriteRule ^(de|en)\/ $0 [END]
# - end

# Check for local
#if
RewriteCond %{HTTP:Accept-Language} ^((?!en).)*de [NC]
#then
RewriteRule ^ /de/$0 [L,R=301]
#else
RewriteRule ^ /en/$0 [L,R=301]
# - end

```
