$f = Get-Content 'd:\electromaison\frontend\src\pages\admin\Commandes.jsx'
$f[46] = "            ['dashboard', 'Tableau de bord', '/admin/dashboard'],"
$f[47] = "            ['package', 'Produits', '/admin/produits'],"
$f[48] = "            ['tag', 'Cat\u00e9gories', '/admin/categories'],"
$f[49] = "            ['cart', 'Commandes', '/admin/commandes'],"
$f[50] = "            ['users', 'Utilisateurs', '/admin/clients']"
$f | Set-Content 'd:\electromaison\frontend\src\pages\admin\Commandes.jsx' -Encoding UTF8
Write-Output 'Done'
