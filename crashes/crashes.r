setwd('~/GitHub/scotter.github.io/crashes')

crashes_2014 <- read.csv('2014alcocrash.csv')
names(crashes_2014) <- tolower(names(crashes_2014))

injuries_2014 <- subset(crashes_2014, 
  max_severity_level %in% seq(1,8) &
  time_of_day != 9999 &
  !is.na(dec_lat) & !is.na(dec_long)
)

dim(injuries_2014)

injuries_2014 <- injuries_2014[,c('day_of_week','collision_type','crash_month','weather','vehicle_count','time_of_day','maj_inj_count','max_severity_level','dec_lat','dec_long')]

write.csv(injuries_2014, file='injuries_2014.csv', row.names=FALSE)