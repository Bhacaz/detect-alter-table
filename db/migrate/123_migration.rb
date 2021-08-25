class Migration
  def change
    change_table :test do
      t.string :new_column
    end
  end
end
