//全局变量
var map = null;

//谷歌图层
var googleMapLayer = new ol.layer.Tile({
	source : new ol.source.XYZ({
		url : 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i345013117!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0'
	})
});

//本地osm资源
var openStreetMapLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
});

//绘画对象
var drawObject = null;

//绘画图层
var source_draw = new ol.source.Vector({wrapX: false});
var layer_draw  = new ol.layer.Vector({
	source: source_draw
});

//初期化加点图层
var layer_points = null;

//引入4301坐标系
proj4.defs("EPSG:4301","+proj=longlat +ellps=bessel +towgs84=-146.336,506.832,680.254,0,0,0,0 +no_defs");

//定义样式
var styles = {
  'Circle': new ol.style.Style({
      image: new ol.style.Circle({
          radius: 10,
          fill: new ol.style.Fill({
              color: 'rgba(255,0,0,0.2)'
          }),
          stroke: new ol.style.Stroke({color: 'blue', width: 3})
      })
      // image: new ol.style.Icon({
      //   src: '../public/img/marker_red_sprite.png'
      // })
    }),
	'icon': new ol.style.Style({
	    image: new ol.style.Icon({
	      anchor: [0.5, 1],
	      src: 'https://openlayers.org/en/v4.1.1/examples/data/icon.png'
	    })
	 })
}


$(function() {
	initMap();
	
	if(map){
		init_layer_getPoints();
	}
	
	$("#type").change(function(){
		map.removeInteraction(drawObject);
		if(this.value !== 'None'){
			drawObject = new ol.interaction.Draw({
				source: source_draw,
				type: /** @type {ol.geom.GeometryType} */ (this.value)
	        });
			
			//注册绘画完毕事件
			drawObject.on('drawend', function(event){
	            drawend_event(event);
	        });
			
			//注册交互动作
	        map.addInteraction(drawObject);
		}
	})
})





function initMap() {

	map = new ol.Map({
	    controls: ol.control.defaults({
	        attribution: false
	    }).extend([
	        // new ol.control.FullScreen(),		//全屏
	        // new ol.control.MousePosition(),	//右上角坐标
	        // new ol.control.OverviewMap(),	//鹰眼
	        new ol.control.ScaleLine(),
	        new ol.control.ZoomSlider(),
	        // new ol.control.ZoomToExtent()
	    ]),
	    layers: [googleMapLayer,
	        // new ol.layer.Tile({
	        //     source: new ol.source.TileDebug({
	        //       projection: 'EPSG:3857',
	        //       tileGrid: googleMapLayer.getSource().getTileGrid()
	        //     })
	        //   }),
	        layer_draw
	    ],
	    target: 'map',
	    view: new ol.View({
	        center: [15735671.417358104, 5321653.862432909],
	        projection: 'EPSG:3857',
	        zoom: 6
	    })
	});

	map.on('click', function(event) {
	    console.log();
	    map.forEachFeatureAtPixel(event.pixel, function(feature) {
	        feature.dispatchEvent({ type: 'click', event: event });
	    });
	});

	map.on('moveend', function(event) {
	    var coordinate = map.getView().getCenter();
	    var dbCoordinate = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4301');

	    console.log(ol.proj.transform([-20037508.34, 20037508.34], 'EPSG:3857', 'EPSG:4301'));

	    console.log("中心座標(3857): [" + coordinate[0] + "," + coordinate[1] + "]");
	    console.log("中心座標(4301): [" + dbCoordinate[0] + "," + dbCoordinate[1] + "]");
	});

	return false;



	//加载本地瓦片
	var resolutions = [];
   	var maxZoom = 18;

   // 计算百度使用的分辨率
	for (var i = 0; i <= maxZoom; i++) {
	    resolutions[i] = Math.pow(2, maxZoom - i);
	}

	var tilegrid = new ol.tilegrid.TileGrid({
	    origin: [0, 0],
	    resolutions: resolutions // 设置分辨率
	});


	
	var baiduSource = new ol.source.TileImage({
	    projection: 'EPSG:3857',
	    tileGrid: tilegrid,
	    tileUrlFunction: function(tileCoord, pixelRatio, proj) {

	        var z = tileCoord[0];
	        var x = tileCoord[1];
	        var y = tileCoord[2];

	        // 百度瓦片服务url将负数使用M前缀来标识
	        if (x < 0) {
	            x = -x;
	        }
	        if (y < 0) {
	            y = -y;
	        }

	        return 'http://online2.map.bdimg.com/onlinelabel/?qt=tile&x=' + x + '&y=' + y + '&z=' + z + '&styles=pl&udt=20160321&scaler=2&p=0';
	        //换成本地路径的瓦片
	        //return "../public/Tiles/"+z+"/"+x+"/"+y+".png";
	    }
	});

	
	var baiduMapLayer2 = new ol.layer.Tile({
       source: baiduSource,
       extent : [-20037508.34, -20037508.34, 20037508.34, 20037508.34]
    });
	
	map = new ol.Map({
	    controls: ol.control.defaults({
	        attribution: false
	    }).extend([
	        // new ol.control.FullScreen(),		//全屏
	        // new ol.control.MousePosition(),	//右上角坐标
	        // new ol.control.OverviewMap(),	//鹰眼
	        new ol.control.ScaleLine(),
	        new ol.control.ZoomSlider(),
	        // new ol.control.ZoomToExtent()
	    ]),
	    layers: [baiduMapLayer2,
	        // new ol.layer.Tile({
	        //     source: new ol.source.TileDebug({
	        //         projection: 'EPSG:3857',
	        //         tileGrid: baiduMapLayer2.getSource().getTileGrid()
	        //     })
	        // }),
	        layer_draw
	    ],
	    target: 'map',
	    view: new ol.View({
	        center: [15735671.417358104, 5321653.862432909],
	        projection: 'EPSG:3857',
	        resolutions: resolutions,
	        zoom: 6
	    })
	});
}

function init_layer_getPoints(){
	$.getJSON("../public/data/point.json", function(json){
		var _points = []
        $.each(json.point,function(n,item){
				_points[n] = new ol.Feature({
					//默认只支持4326和3857的坐标系。如果需要4301的坐标系 需要引用proj4
					geometry: new ol.geom.Point(ol.proj.transform(eval("(" + item.point + ")").coordinates, 'EPSG:4301', 'EPSG:3857'))
					//geometry:mapBase.getTransformedGeometry(item.point)
				})
				
				//添加唯一ID 和 属性信息
				//_points[n].setId = item.prefectureCode+"-"+item.cityCode+"-"+item.ooazaCode+"-"+item.koazaCode;
				//_points[n].setProperties = {ooazaName:item.ooazaName,ooazaNameKana:item.ooazaNameKana};
				
				//添加click事件(该事件的触发必须在map中定义click事件，通过feature来找到执行该click)
				_points[n].on('click',function(evnet){
					//console.log(evnet.target.getGeometry().getId());
					//console.log(evnet.target.getGeometry().getProperties());
		        })
				
				//要素添加样式
				//_points[n].setStyle(getStyleTempVector);
			})
			
			layer_Points = new ol.layer.Vector({
				source: new ol.source.Vector({wrapX: false})
			});

			layer_Points.getSource().addFeatures(_points);
			map.addLayer(layer_Points);
    });

	return false;


	$.ajax({
		type : "post",
		url : "map/getPoints",
		data : {},
		dataType : "text",
		async : false,
		success : function(result) {
			if (!result || result.length == 0) {
				return;
			}
			var data = eval("(" + result + ")");
			
			var _points = []
			$.each(data,function(n,item){
				_points[n] = new ol.Feature({
					//默认只支持4326和3857的坐标系。如果需要4301的坐标系 需要引用proj4
					geometry: new ol.geom.Point(ol.proj.transform(eval("(" + item.point + ")").coordinates, 'EPSG:4301', 'EPSG:3857'))
					//geometry:mapBase.getTransformedGeometry(item.point)
				})
				
				//添加唯一ID 和 属性信息
				_points[n].setId = item.prefectureCode+"-"+item.cityCode+"-"+item.ooazaCode+"-"+item.koazaCode;
				_points[n].setProperties = {ooazaName:item.ooazaName,ooazaNameKana:item.ooazaNameKana};
				
				//添加click事件(该事件的触发必须在map中定义click事件，通过feature来找到执行该click)
				_points[n].on('click',function(evnet){
					//console.log(evnet.target.getGeometry().getId());
					//console.log(evnet.target.getGeometry().getProperties());
		        })
				
				//要素添加样式
				//_points[n].setStyle(getStyleTempVector);
			})
			
			layer_Points = new ol.layer.Vector({
				source: new ol.source.Vector({wrapX: false})
			});

			layer_Points.getSource().addFeatures(_points);
			map.addLayer(layer_Points);		
		},
		error : function(result) {
		}
	});
}

//绘画完毕后的触发事件
function drawend_event(event){
	
	//console.log(JSON.stringify(event.feature.getGeometry().getType()));
	if(event.feature.getGeometry().getType()=='Polygon'){
		//console.log(JSON.stringify(event.feature.getGeometry().getCoordinates()));
		var arrays =event.feature.getGeometry().getCoordinates()[0];
		var data_array = [];
		for(var i =0 ; i <arrays.length;i++){
			//console.log(ol.proj.transform([arrays[i][0],arrays[i][1]], 'EPSG:3857', 'EPSG:4326'));
			//console.log(ol.proj.toLonLat([arrays[i][0],arrays[i][1]],'EPSG:4326'));
			data_array.push(ol.proj.transform([arrays[i][0],arrays[i][1]], 'EPSG:3857', 'EPSG:4301').join(' '))
		}
		console.log(data_array.join(','))



		$.getJSON("../public/data/polygon.json", function(json){
			var _points = []
				$.each(json.point,function(n,item){
					_points[n] = new ol.Feature({
						//默认只支持4326和3857的坐标系。如果需要4301的坐标系 需要引用proj4
						geometry: new ol.geom.Point(ol.proj.transform(eval("(" + item.point + ")").coordinates, 'EPSG:4301', 'EPSG:3857'))
						//geometry:mapBase.getTransformedGeometry(item.point)
					})
					
					//要素添加样式
					_points[n].setStyle(styles.Circle);
				})
				
//				layer_Points = new ol.layer.Vector({
//					source: new ol.source.Vector({wrapX: false})
//				});

				layer_Points.getSource().addFeatures(_points);
//				map.addLayer(layer_Points);	
    	});


		return false;
		//调后台查找该区域内存在的点
		$.ajax({
			type : "post",
			url : "map/findPoints",
			data : {data_array:data_array.join(',')},
			dataType : "text",
			async : false,
			success : function(result) {
				if (!result || result.length == 0) {
					return;
				}
				var data = eval("(" + result + ")");
				
				var _points = []
				$.each(data,function(n,item){
					_points[n] = new ol.Feature({
						//默认只支持4326和3857的坐标系。如果需要4301的坐标系 需要引用proj4
						geometry: new ol.geom.Point(ol.proj.transform(eval("(" + item.point + ")").coordinates, 'EPSG:4301', 'EPSG:3857'))
						//geometry:mapBase.getTransformedGeometry(item.point)
					})
					
					//要素添加样式
					_points[n].setStyle(styles.Circle);
				})
				
//				layer_Points = new ol.layer.Vector({
//					source: new ol.source.Vector({wrapX: false})
//				});

				layer_Points.getSource().addFeatures(_points);
//				map.addLayer(layer_Points);		
			},
			error : function(result) {
			}
		});
	}else if(event.feature.getGeometry().getType() == 'Circle'){
		console.log(event.feature.getGeometry().getCenter());
		//console.log(event.feature.getGeometry().getClosestPoint());
		
		console.log(event.feature.getGeometry().getRadius());
		
	}
}


//模拟登陆
function demoLogin(){
	console.log("模拟登陆，通过调取后台返回该用户的地图坐标");
	
//	var layer_temp = new ol.layer.Vector({
//		source: new ol.source.Vector({wrapX: false})
//	});
	
	var marker = new ol.Feature({
		geometry: new ol.geom.Point([16093398.053945288,5386929.740375914])//16093398.053945288,5386929.740375914
	})
	
	marker.setStyle(styles.icon);
	layer_Points.getSource().addFeature(marker);
	
	//map.addLayer(layer_temp);		
	
	map.getView().animate({
        center: [16093398.053945288,5386929.740375914],//
        zoom : 10,			
        duration: 2000		//持续时间
	});
}


getResolutionFromScale = function(scale, dpi) {
		var resolution;
		var M_PER_INCH = 25.4 / 1000;
		if (scale) {
			resolution = scale / dpi * M_PER_INCH;
		}
		return resolution;
	};