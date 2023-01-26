# 栅格数据实现地理探测器：基于R语言geodetector包

[mp.weixin.qq.com](https://mp.weixin.qq.com/s/hq095X1xYJ4Nt6E-hKDCpw)一周更新一两次的 疯狂学习GIS

  本文介绍基于**R**语言中的`geodetector`包，依据多张**栅格图像**数据，实现**地理探测器**（**Geodetector**）操作的详细方法。

  需要说明的是，在**R**语言中进行**地理探测器**操作，可以分别通过`geodetector`包、`GD`包等`2`个包实现。其中，`geodetector`包是**地理探测器模型**的原作者团队早先开发的，其需要保证输入的**自变量数据**已经全部为**类别数据**；而`GD`包则是另外一位学者开发的，其可以自动实现自变量数据的**最优离散化方法**选取与执行——即我们可以直接把自变量带入这一包中，无需额外进行数据的离散化。本文介绍的是基于前者，即`geodetector`包实现地理探测器的具体操作；基于后者的方法，我们将在后续推文中介绍。此外，如果希望基于**Excel**实现**地理探测器**，大家可以参考[地理探测器Geodetector软件的下载、应用与结果解读](http://mp.weixin.qq.com/s?__biz=MzkyNTIxNDQ0MQ==&mid=2247486078&idx=1&sn=2538cdb8d719c2de7d1c0ff30051c92b&chksm=c1c8b9f8f6bf30eed28a874d548ffe8f01cee5233b615431084e120b5b4a5851b5ad0eb829c4&scene=21#wechat_redirect)这篇文章。

## 1 包的配置与导入

  首先，我们可以先到`geodetector`包在**R**语言中的官方网站（https://cran.r-project.org/web/packages/geodetector/index.html），大致了解一下该包的简要介绍、开发团队、其他依赖包等基本信息；如下图所示。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLib2v30jIIUDTHMsaJJ0LStrxj2Has6YzEvAsP0puoia0yRUKsA07HUoGw%2F640%3Fwx_fmt%3Dpng)

  随后，我们开始`geodetector`包的下载与安装。输入如下所示的代码，即可开始包的下载与安装过程。

    1install.packages("geodetector")

  输入代码后，按下`回车`键，运行代码；如下图所示。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLibgrc4vFzuoI88kgFY4udJMSVy9t5ofrVeYDGnZfic60uObW1axhY3KxA%2F640%3Fwx_fmt%3Dpng)

  随后，将自动下载并配置`geodetector`包；此外，在安装`geodetector`包时，会自动将其所需依赖的其他包（如果在此之前没有配置过）都一并配置好，非常方便。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLib9GthBficYuyicExQ9YzCE7pGl1TI6rLWjT6n4R7RoSPHqsjX7WESryRw%2F640%3Fwx_fmt%3Dpng)

  接下来，输入如下的代码，将`geodetector`包导入。

    1library(geodetector)

  此时，在**RStudio**右下方的“**Packages**”中，可以看到`geodetector`包处于选中的状态，表明其已经配置成功，且完成导入。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLib2mtiaE5Qt2Tw9mqOfgeIxzbXV8C9LmDcKtR1zQIL4XODfA0YswFa2Uw%2F640%3Fwx_fmt%3Dpng)

## 2 栅格数据读取与预处理

  接下来，我们首先依据[R语言raster包读取栅格遥感影像](http://mp.weixin.qq.com/s?__biz=MzkyNTIxNDQ0MQ==&mid=2247487058&idx=1&sn=53ce2f2bf941a9e04279ac74e33c2d5a&chksm=c1c8bdd4f6bf34c2874a96b8aef478ad2fc75a52fec0daad551c5305ea30f59ace116557c75f&scene=21#wechat_redirect)中提到的方法，读取栅格数据。因为我们是要基于栅格数据完成地理探测器的分析，因此很显然是需要批量导入多张栅格数据的。

  读取栅格数据完毕后，我们通过如下代码，基于`getValues()`函数，从原本的`RasterStack`格式的数据中，将栅格数据的像元数值提取出来；随后，基于`View()`函数显示出这一变量。

    1tif_file_all_matrix<-getValues(tif_file_all)2View(tif_file_all_matrix)

  运行上述代码，将在**RStudio**的左上方看到变量`tif_file_all_matrix`的数据情况，如下图所示。可以看到，此时`tif_file_all_matrix`变量是一个`3`列、`6377265`行的**矩阵**（`Matrix`）数据；其中，每一列表示每一个图层的数据，每一行则是每一个图层在同一空间位置上各自像元的数值。此外，每一列的名称即为其所对应的图层的名称。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLib4D0V1WPeBK0ibvTWKgXaH8PyIFSouJkkTLfXvoe9Raa943LQ1KwHb1g%2F640%3Fwx_fmt%3Dpng)

  从上图可以看出，每一列数据中都有很多**无效值**（**NA**值），即原本栅格图像中的**无效值**（**NoData**值）；由于在后期的地理探测器分析过程中，出现无效值会影响我们分析的结果，因此我们需要通过`na.omit()`函数将无效值去除。`na.omit()`是一个非常方便的函数，其可以将`Matrix`数据中存在**NA**值的行直接去除（只要这一行中存在至少一个**NA**，就将这一行去除）。

    1tif_matrix=na.omit(tif_file_all_matrix)2View(tif_matrix)

  随后，我们再看得到的新变量，可以看到存在**NA**值的行都不复存在了；如下图所示。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLibg7FZicaSaujRNVR1x3bYnpOxCRtUPaDS565hFXFMcnTmia8gpnqX6GQQ%2F640%3Fwx_fmt%3Dpng)

  接下来，由于`geodetector`包实现地理探测器操作时，需要保证输入数据为**数据框**（`Data Frames`）格式，因此我们需要将`Matrix`转为`Data Frames`；通过`as.data.frame()`函数即可实现这样的转换。

    1tif_frame<-as.data.frame(tif_matrix)2View(tif_frame)

  运行上述代码，可以看到已经获取到`Data Frames`格式的变量`tif_frame`了；当然，从外观上看，其和`Matrix`格式的变量`tif_matrix`其实长得是一样的。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLibgyTd2wVnV9FxSjfhE7TjiczYonwvlmdeJy6mXuDAYhH7xrS5LB0SiaZw%2F640%3Fwx_fmt%3Dpng)

  完成上述数据预处理操作，我们即可开始地理探测器操作。需要注意的是，本文开头也提到了，基于`geodetector`包实现地理探测器操作时，如果输入的自变量数据是连续数据，我们需要手动将连续数据转为类别数据。这一步骤可以通过**ArcGIS**的重分类等工具来实现，这里就不再赘述。

## 3 地理探测器分析

  完成上述数据预处理操作，我们即可开始地理探测器的各项具体操作。需要注意的是，本文主要对分析的具体方法加以介绍；至于**分析结果的详细研读方法**，大家参考文章[地理探测器Geodetector软件的下载、应用与结果解读](http://mp.weixin.qq.com/s?__biz=MzkyNTIxNDQ0MQ==&mid=2247486078&idx=1&sn=2538cdb8d719c2de7d1c0ff30051c92b&chksm=c1c8b9f8f6bf30eed28a874d548ffe8f01cee5233b615431084e120b5b4a5851b5ad0eb829c4&scene=21#wechat_redirect)即可，我们这里只做简单的介绍。

## 3.1 分异及因子探测

  首先，我们进行**分异及因子探测**。在`geodetector`包中，我们可以基于`factor_detector()`函数实现这一操作。其中，`"A_LCCS0"`是本文中的因变量，`"DEM_Reclass"`与`"F_LCS0"`则是本文中的自变量；`tif_frame`则是`Data Frames`格式变量的名称。

  在这里需要注意，如果大家只需要分析**一个自变量**与因变量的影响关系，用下方第一句代码所示的格式即可；如果需要分析**多个自变量**与因变量的影响关系，则需要用下方第二句代码所示的格式，将多个自变量的名称通过`c()`函数，组成一个**向量**（`Vector`）格式的变量即可。

    1factor_detector("A_LCCS0","F_LCS0",tif_frame)2factor_detector("A_LCCS0",c("DEM_Reclass","F_LCS0"),tif_frame)

  我们首先以上述第一句代码为例来运行，运行后稍等片刻（具体时长与数据量的大小有关），将会得到如下所示的**分异及因子探测**结果。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLibBwsOicBycdH09rGicWianjb1X3gTP3tM3gEfkPjDwkzCnBDSU2D0f7DJA%2F640%3Fwx_fmt%3Dpng)

  其次，再运行上述第二句代码，得到如下所示的结果。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLibWCUicdQR3icibgwXQllOp4K5AoOnichzY0xXeUKPZz6iaOB1L6RzH1PHC0g%2F640%3Fwx_fmt%3Dpng)

  可以看到，`factor_detector()`函数将会给出每一个自变量对于因变量的`q`值与`p`值。

## 3.2 交互作用探测

  接下来，我们执行**交互作用探测**；这一操作通过`interaction_detector()`函数来执行即可。由于**交互作用探测**是需要对多个不同的自变量加以组合，所以很显然这一操作在只有**一个自变量**的情况下是没有办法执行的；因此我们需要用前述第二种代码格式，即通过`c()`函数，将多个自变量的名称组成一个**向量**（`Vector`）格式的变量后加以执行。

    1interaction_detector("DEM_Reclass",c("F_LCS0","K_NDVI"),tif_frame)

  运行上述代码，稍等片刻后将出现如下所示的结果。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLibM6Rs9yNiaj4m7FP8eKUKujIzP0rYGN7yghnicPEJlePXnlOCFqQxyZiaQ%2F640%3Fwx_fmt%3Dpng)

  可以看到，`interaction_detector()`函数将会给出每一种自变量组合方式对应的`q`值。但是这里有一个问题——上述结果只能看到不同组合对应的`q`值变化，但是似乎看不出这种组合方式到底属于**非线性减弱**、**单因子非线性减弱**、**双因子增强**、**独立**、**非线性增强**中的哪一种情况。

## 3.3 风险区探测

  接下来，我们执行**风险区探测**；这一操作通过`risk_detector()`函数来实现即可，同样是具有**一个自变量**和**多个自变量**的情况。我们这里就直接以多个自变量的情况来展示代码与结果了。

    1risk_detector("A_LCCS0",c("DEM_Reclass","F_LCS0"),tif_frame)

  运行上述代码，稍等片刻后将出现如下所示的结果。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLibnzHXKibXDCIAfHvoLyyjBLib4X4cD7Wm1x3xbK90ErC23flCsGZr8RZw%2F640%3Fwx_fmt%3Dpng)

  可以看到，`risk_detector()`函数首先将会给出每一种自变量的**不同分级**中，对应的因变量平均值——这里自变量的**分级**指的就是重分类后其的**每一个分类**；其次，其将给出每一种自变量的分级与分级**对应的平均值**之间，是否具有显著性差异。

## 3.4 生态探测

  接下来，我们执行**生态探测**；这一操作通过`ecological_detecto()`函数来实现即可。由于**生态探测**是需要判断多个不同的自变量中，两两之间是否具有显著差异，所以很显然这一操作同样在只有一个自变量的情况下是没有办法执行的；因此我们需要用前述第二种代码格式，即通过`c()`函数，将多个自变量的名称组成一个**向量**（`Vector`）格式的变量后加以执行。

    1ecological_detector("A_LCCS0",c("DEM_Reclass","F_LCS0"),tif_frame)

  运行上述代码，稍等片刻后将出现如下所示的结果。

![图片](https://cubox.pro/c/filters:no_upscale()?valid=false&imageUrl=https%3A%2F%2Fmmbiz.qpic.cn%2Fmmbiz_png%2FEsKJ0tMQ4EBiaIye7JiaAaVTEba7plYKLibEZUnIfNpAPicnlBJc6ZgwicfvP794kAicicq9ibgz8C82voRicTOd91jRQXA%2F640%3Fwx_fmt%3Dpng)

  至此，我们就完成了基于**R**语言中的`geodetector`包，基于多张**栅格图像**数据，实现**地理探测器**（**Geodetector**）操作的完整流程。

欢迎关注：疯狂学习GIS

[查看原网页: mp.weixin.qq.com](https://mp.weixin.qq.com/s/hq095X1xYJ4Nt6E-hKDCpw)
