jQuery.githubUser = function(username, callback) 
{  
   jQuery.getJSON('https://api.github.com/users/'+username+'/repos?access_token=3cfe9e3d76048acf5f3dc36fb4ebd45bfddbf481&callback=?',callback);
} 
jQuery.githubCommit = function(username, reposname, callback) 
{  
   jQuery.getJSON('https://api.github.com/repos/'+username+'/'+ reposname +'/commits?access_token=3cfe9e3d76048acf5f3dc36fb4ebd45bfddbf481&callback=?',callback);
}
jQuery.githubAjout = function(username, reposname, callback) 
{  
   jQuery.getJSON('https://api.github.com/repos/'+username+'/'+ reposname +'/stats/contributors?access_token=3cfe9e3d76048acf5f3dc36fb4ebd45bfddbf481&callback=?',callback);
}

 
jQuery.fn.loadRepositories = function(username) {
    this.html("<span>Problem finding " + username +"'s repositories...</span>");
    var ce = this;

    $.githubUser(username, function(data) {
       var repos = data.data;

       var listeRepos  = []; 
       var ajout = [];
       var bool = false;
       var arrayCommitPC = new Array();

        for(var y = 0; y <= 6; y++)
        {
          for(var x = 1; x <= 23; x++)
          {
            arrayCommitPC.push({'y' : y, 'x' : x * 3600000, 'marker' : {'radius' : 0}});
          }
        }

        var laDate;
        var leJour;
        var lHeure;
        var lHeureMS;

        $(repos).each(function() 
        {
            if (this.name != (username.toLowerCase()+'.github.com'))
             {
               
                  var nomRepos = this.name;

                    $.githubCommit(username, nomRepos, function(datacommits)
                    {
                      var arrayCommit = [['committer', 'Nombre de commits']];
                      var reposCommit = datacommits.data;
                       
                
                       $(reposCommit).each(function() 
                       {
                          bool = false;
                          if (this.commit)
                          {
                              laDate = new Date (this.commit.author.date);
                              leJour = laDate.getDay();
                              lHeure = laDate.getHours();
                              lHeureMS = lHeure * 3600000;

                                for (var index = 0 ; index < arrayCommitPC.length ; index ++)
                                {
                                  if (leJour == arrayCommitPC[index]['y'] && lHeureMS == (arrayCommitPC[index]['x']))
                                  {
                                    arrayCommitPC[index]['marker']['radius'] ++;
                                    index = arrayCommitPC.length;
                                  }
                                }

                            for (var index = 0 ; index < arrayCommit.length ; index ++)
                            {
                              if (this.commit.author.name == arrayCommit[index][0] )
                                {
                                  arrayCommit[index][1] ++;
                                  bool = true;
                                  index = arrayCommit.length;
                                }
                            }
                            if(!bool)
                            {
                              arrayCommit.push([this.commit.author.name, 1])
                              bool = true;
                            }
                          
                          }

                    $.githubAjout(username, nomRepos, function(dataAjout)
                    {
                      var reposAjout = dataAjout.data;
                       $(reposAjout).each(function() 
                       {
                              if(this.author)
                              {
                                    var semaines = this.weeks;
                                    $(semaines).each(function() 
                                    {
                                      bool = false;

                                      for (var index = 0 ; index < ajout.length ; index ++)
                                      {

                                          if (this.w == ajout[index].semaine)
                                          {
                                            ajout[index].add += this.a;
                                            ajout[index].del += this.d;
                                            bool = true;
                                            index = ajout.length;

                                          }
                                      }

                                        if (!bool)
                                        {
                                          var semaines = this.weeks;
                                          ajout.push( { semaine: this.w, add: this.a, del: this.d });
                                        }

                                    });

                              }

                        }); //fin each repos ajout
   
                    }); //FIN GITHUB AJOUT


                        }); //fin each repos commit

                       if(bool && arrayCommit != [])
                          {
                              var objet = {nom:nomRepos, commit:arrayCommit};
                              listeRepos.push(objet);
                          }
                       
                    }); //FIN GITHUBCOMMIT 


 
              }// fin if this. name
     
  }); //fin each (repos)



setTimeout(function() {

googleGr(listeRepos);

var sem = [];
var add = [];
var del = [];


for (var i = 0 ; i < ajout.length ; i ++)
{

var a = new Date(ajout[i].semaine*1000);
var months = ['01','02','03','04','05','06','07','08','09','10','11', '12'];
var year = a.getFullYear();
var month = months[a.getMonth()];
var day = a.getDate();
console.log(day);
if (day <= 9)
  day = '0' + day;

  ajout[i].semaine = year + '-' + month + '-' + day;

}

function Comparator(a,b){
if (a.semaine < b.semaine) return -1;
if (a.semaine > b.semaine) return 1;
return 0;
}

ajout = ajout.sort(Comparator);

for (var i = 0 ; i < ajout.length ; i ++)
{

  var months = ['Jan','Feb','Mars','Avr','Mai','Juin','Juil','Aout','Sept','Oct','Nov','Dec'];
  var date = ajout[i].semaine.split('-');

  sem.push(date[2] + ' ' + months[date[1] - 1] + ' ' + date[0]);
  add.push(ajout[i].add);
  del.push(ajout[i].del);

}
  $(function () {

    $('#coll2').highcharts({
      
      chart: {
        defaultSeriesType: 'scatter'
      },

      title: {
        text: 'Punchcard'
      },

      xAxis: {
        type: "datetime",
        dateTimeLabelFormats: {
          hour: '%H:%M'  
        },
        tickInterval: 3600000 * 1
      },

      yAxis: {
        categories: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      },

      plotOptions: {
        scatter: {
          marker: {
            radius: 5,
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          states: {
            hover: {
              marker: {
                enabled: false
              }
            }
          },
          tooltip: {
            headerFormat: '<b>commits</b><br>',
            pointFormat: '{point.marker.radius}'
          }
        }
      },
      
      series: [{
        data: arrayCommitPC,
        name : 'heure'
      }]

    });
    
  }); // fin fonction


$(function () {
    $('#coll3').highcharts({
        chart: {
            type: 'area'
        },
      title: {
        text: 'Ajouts et délétions'
      },
        xAxis: {
            allowDecimals: false,
            title: {
                text: 'Semaines'
            },
            labels: {
                formatter: function () {
                    return this.value; 
                }
            },
            categories: sem
        },
        yAxis: {
            title: {
                text: 'Données (octets)'
            },
            labels: {
                formatter: function () {
                    return this.value / 1000 + 'k';
                }
            }
        },
        tooltip: {
            pointFormat: '{series.name} de <b>{point.y:,.0f}</b> octets de données<br/>'
        },
        plotOptions: {
            area: {
               // pointStart: 1940,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Ajouts',
             data: add,
            color: '#43BF43'
        }, {
            name: 'Délétions',
            data: del,
            color: '#C63333'
        }]
    });
});

ce.html("<span>Statistiques de " + username +"</span>");
}, 1500);



}); //github user
      

};  //fin loadRep

