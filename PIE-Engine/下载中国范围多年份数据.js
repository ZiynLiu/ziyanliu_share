//本代码示例为下载中国范围2012-2020年ODIAC碳排放数据
//加载中国区域范围
var roi = pie.FeatureCollection("RESDC/WORLD_COUNTRY_BOUNDARY")
	.filter(pie.Filter.eq('fcname','中国'))
	.first()
	.geometry();
Map.addLayer(roi, {color:"#ff0000", fillColor:"#00000000"}, "china");
//影像集合
var images = pie.ImageCollection("ODIAC/CO2_1KM")

//主函数
var get_odiac_image = function(file_name,date_start,date_end){
	var ce = images
		.filterDate(date_start,date_end)
		.select("land")
		.filterBounds(roi)
		.median()
		.clip(roi)
	var visParams = {
		min: 0,
		max: 100,
		palette: ["#000000",
				  "#78F34A",
				  "#DEFF51",
				  "#F7D941",
				  "#FC9624",
				  "#FF0000"]
	}
	Map.addLayer(ce,visParams,"ce")
	Export.image({
		image: ce,
		description: file_name,
		region: roi,
		scale: 1000
	});
}

for (var i=2010;i<2020;i++){
	var file_name = i+"year";
	var date_start = pie.Date.fromYMD(i,1,1);
	var date_end = date_start.advance(1,"year");
	get_odiac_image(file_name,date_start,date_end)

}
