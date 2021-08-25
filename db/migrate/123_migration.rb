class Migration
  def change
    create_table :test do
      t.string :new_column
    end
  end
end
