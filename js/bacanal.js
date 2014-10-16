d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function formata_uf(dado) {
    ufs = dado.split("-")
    ufs.pop()
    if (ufs.length == 1) {
        return ufs[0]
    } else {
        saida = ""
        for (uf in ufs) {
            if (uf < ufs.length -2) {
                saida += ufs[uf] +", "
            } else if (uf <ufs.length -1){
                saida += ufs[uf]
            } else {
                saida += " e " +ufs[uf]
            }
        }
        return saida
    }
}

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
      .style("opacity", 0);
  var margin = { top: 60, right: 0, bottom: 100, left: 70 },
      width_min = 1000,
      width = Math.max($("#chart").width()/1.5 - margin.left - margin.right,width_min),
      gridSize = Math.floor(width / 32),
      height = width,
      legendElementWidth = gridSize*2,
      buckets = 9,
      colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
      partidos1 = ['PR', 'PSDB', 'SD', 'PSC', 'DEM', 'PPS', 'PSD', 'PTB', 'PRB', 'PP', 'PHS', 'PROS', 'PDT', 'PC do B', 'PT do B', 'PSDC', 'PEN', 'PSB', 'PTC', 'PSL', 'PV', 'PMDB', 'PRP', 'PTN', 'PT', 'PRTB', 'PPL', 'PMN', 'PSOL', 'PSTU', 'PCB', 'PCO'],
      partidos2 = ['PR', 'PSDB', 'SD', 'PSC', 'DEM', 'PPS', 'PSD', 'PTB', 'PRB', 'PP', 'PHS', 'PROS', 'PDT', 'PC do B', 'PT do B', 'PSDC', 'PEN', 'PSB', 'PTC', 'PSL', 'PV', 'PMDB', 'PRP', 'PTN', 'PT', 'PRTB', 'PPL', 'PMN', 'PSOL', 'PSTU', 'PCB', 'PCO'];
      
  d3.csv("data.csv",
    function(d) {
        saida = {
            partido1: d.partido1,
            partido2: d.partido2,
            value: +d.valor,
            ufs: formata_uf(d.ufs),
            soma: d.soma
        }
      return saida
    },
    function(error, data) {
        
      var colorScale = d3.scale.quantile()
          .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
          .range(colors);

      var svg = d3.select("#chart").append("svg")
          .attr("width", width*1.1 + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
          .data(partidos1)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); })
            .style("color","#aaa");

        var totais = svg.selectAll(".total_aliancas")
                .data(partidos1)
                .enter().append("text")
                  .text(function (d) { 
                      dado = data.filter(function (el) { return el.partido1 == d }); 
                      if (dado.length > 0) 
                          return dado[0].soma 
                       else 
                          return 0
                  })
                  .attr("partido",function(d) {return d})
                  .attr("x", width*1.05)
                  .attr("y", function (d, i) { return i * gridSize; })
                  .style("text-anchor", "end")
                  .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
                  .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); })
                  .style("color","#aaa");

        svg.append("text").attr("x",width*1.02).attr("y",-5).text("TOTAL").attr("class", "dayLabel mono axis axis-workweek")


      var timeLabels = svg.selectAll(".timeLabel")
          .data(partidos2)
          .enter().append("g")
              .attr("x", function(d, i) { return i * gridSize; })
              .attr("y", -15)
              .attr("transform", function (d,i) {
                  return "translate("+(gridSize*i+10)+",-7)"   
              })
              .append("text")
                .text(function(d) { return d; })
                .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); })
                .style("text-anchor", "start")
                .attr("dy", ".35em")
                .attr("transform", function (d,i) {
                    return "rotate(-45)"   
                })
                .style("color","#aaa");
            

      var heatMap = svg.selectAll(".hour")
          .data(data)
          .enter().append("rect")
          .attr("x", function(d) { return (partidos1.indexOf(d.partido1)) * gridSize; })
          .attr("y", function(d) { return (partidos2.indexOf(d.partido2)) * gridSize; })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "hour bordered")
          .attr("width", gridSize)
          .attr("height", gridSize)
          .style("fill", colors[0])
          .attr("eixo_x", function (d) { return d.partido2})
          .attr("eixo_y", function (d) { return d.partido1})
          .on("mouseover",function(d) {
              div.transition()
                  .duration(200)
                  .style("opacity", 1);
              div.html(function() {
                  if (d.value > 1) {
                      return "<b>"+d.partido2 + " - " + d.partido1 + "</b>: "+ d.value +" estados</br>"+d.ufs 
                  } else {
                      return "<b>"+d.partido2 + " - " + d.partido1 + "</b>: "+ d.value +" estado </br>"+d.ufs
                  }})

                  .style("left", (d3.event.pageX + 10) + "px")
                  .style("top", (d3.event.pageY + 28) + "px")
                  
          $("text:contains('"+d.partido2+"')[class*='dayLabel']").each(function () {
              if ($(this).text() == d.partido2) {
                  $(this)
                      .css("font-weight","bold")
                      .css("font-size","12pt")
                      }
                  })
              
           $("text[partido*='"+d.partido2+"']").each(function () {
                 if ($(this).attr("partido") == d.partido2) {
                         $(this)
                              .css("font-weight","bold")
                              .css("font-size","12pt")
                              }
                 })
                          
          $("text:contains('"+d.partido1+"')[class*='timeLabel']").each(function () {
              if ($(this).text() == d.partido1) {
                  $(this)
                      .css("font-weight","bold")
                      .css("font-size","12pt")
                      
                  }
              })
          d3.selectAll("rect[eixo_x='"+d.partido2+"']")
              .style("stroke","#737478")
              .moveToFront()
          d3.selectAll("rect[eixo_y='"+d.partido1+"']")
              .style("stroke","#737478")
              .moveToFront()
              
          })
          
          .on("click",function(d) {
              div.transition()
                  .duration(200)
                  .style("opacity", 1);
              div.html("<b>"+d.partido2 + " - " + d.partido1 + "</b>: "+ d.value)
                  .style("left", (d3.event.pageX + 10) + "px")
                  .style("top", (d3.event.pageY + 28) + "px")
          $("text:contains('"+d.partido2+"')[class*='dayLabel']").each(function () {
              if ($(this).text() == d.partido2) {
                  $(this)
                      .css("font-weight","bold")
                      .css("font-size","12pt")
                                 
                      }
                  })
          $("text[partido*='"+d.partido2+"']").each(function () {
                if ($(this).attr("partido") == d.partido2) {
                        $(this)
                              .css("font-weight","bold")
                           .css("font-size","12pt")
                              }
                        })
        
          $("text:contains('"+d.partido1+"')[class*='timeLabel']").each(function () {
              if ($(this).text() == d.partido1) {
                  $(this)
                      .css("font-weight","bold")
                      .css("font-size","12pt")
                      
                  }
              })
        
          d3.selectAll("rect[eixo_x='"+d.partido2+"']")
              .style("stroke","#737478")
              .moveToFront()
          d3.selectAll("rect[eixo_y='"+d.partido1+"']")
              .style("stroke","#737478")
              .moveToFront()
              
              
          })
          
          
          .on("mouseout", function(d) {
              div.transition()
                  .duration(500)
                  .style("opacity", 0);
          $("text:contains('"+d.partido2+"')[class*='dayLabel']").each(function () {
              if ($(this).text() == d.partido2) {
                  $(this)
                      .css("font-weight","normal")
                      .css("font-size","9pt")
                                     
              }
          })
          $("text[partido*='"+d.partido2+"']").each(function () {
                if ($(this).attr("partido") == d.partido2) {
                        $(this)
                             .css("font-weight","normal")
                             .css("font-size","9pt")
                             }
                })
          
          $("text:contains('"+d.partido1+"')[class*='timeLabel']").each(function () {
              if ($(this).text() == d.partido1) {
                  $(this)
                      .css("font-weight","normal")
                      .css("font-size","9pt")
                      
                  }
              })
          d3.selectAll("rect[eixo_x='"+d.partido2+"']").style("stroke","#E6E6E6")
          d3.selectAll("rect[eixo_y='"+d.partido1+"']").style("stroke","#E6E6E6")
              
                                    
          });
          

      heatMap.transition().duration(1000)
          .style("fill", function(d) { return colorScale(d.value); });
      
      var legend = svg.selectAll(".legend")
          .data([0].concat(colorScale.quantiles()), function(d) { return d; })
          .enter().append("g")
          .attr("class", "legend");

      legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", height)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", function(d, i) { return colors[i]; });

      legend.append("text")
        .attr("class", "mono")
        .text(function(d) { return "≥ " + Math.round(d); })
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", height + gridSize);
  });