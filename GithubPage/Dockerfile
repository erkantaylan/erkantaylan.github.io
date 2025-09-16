FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
user root

ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["GithubPage/GithubPage.csproj", "GithubPage/"]
RUN dotnet restore "GithubPage/GithubPage.csproj"

COPY . .
WORKDIR "/src/GithubPage"
RUN dotnet publish "./GithubPage.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

###################################
#FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
#ARG BUILD_CONFIGURATION=Release
#WORKDIR /src
#COPY ["GithubPage/GithubPage.csproj", "GithubPage/"]
#RUN dotnet restore "GithubPage/GithubPage.csproj"
#COPY . .
#WORKDIR "/src/GithubPage"
#RUN dotnet build "./GithubPage.csproj" -c $BUILD_CONFIGURATION -o /app/build
#
#FROM build AS publish
#ARG BUILD_CONFIGURATION=Release
#RUN dotnet publish "./GithubPage.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false


####################################
FROM nginx:alpine AS final
COPY --from=build /app/publish/wwwroot /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]