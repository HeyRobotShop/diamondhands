Rails.application.routes.draw do
  post "/graphql", to: "graphql#execute"
  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
  end
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  
  devise_for :users
  devise_scope :user do
    root 'pages#home'
    get '/pages/admin'
  end

  mount ActionCable.server => '/cable'
  
  get '/add-a-track', to: 'pages#add_a_track'
  resources :users, only: [:index]
  get '/artist/:id', to: 'users#show'
  get '/show_artist/:id', to: 'users#show_artist'
  get '/baked', to: 'pages#home'
  get '/artists', to: 'pages#home'
  get '/about-us', to: 'pages#home'
  get '/instruments', to: 'pages#home'

  # api collection for frontend operations.

  scope :api, module: :api do
    scope :v1, module: :v1 do
      resources :instruments, only: [ :index, :create ]
      post '/selected-instruments', to: 'instruments#selected_instruments'
    end
  end

  resources :tracks, only: [:index, :show, :destroy]
  get '/tracks/show_track/:id' => 'tracks#show_track'
  get '/baked_tracks' => 'tracks#baked'
  
  get 's3_direct_post' => 'tracks#s3_direct_post'
  post 's3_blob_location' => 'tracks#s3_blob_location'
  
  resources :attachments, only: [:index]
  get 'attachment_s3_direct_post' => 'attachments#s3_direct_post'
  post 'attachment_s3_blob_location' => 'attachments#s3_blob_location'

  post 'create_track_comment/:track_id' => 'comments#create_track_comment'
  get 'track_comments/:track_id' => 'comments#track_comments'

  resources :likes
end
