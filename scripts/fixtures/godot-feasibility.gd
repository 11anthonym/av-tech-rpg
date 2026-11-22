extends SceneTree

# This is an engine capability probe, not a port of the browser gameplay.
var failures: int = 0

func _initialize() -> void:
	call_deferred("run_probe")

func check(condition: bool, label: String) -> void:
	if condition:
		print("PASS: " + label)
	else:
		failures += 1
		push_error("FAIL: " + label)

func add_box(parent: Node3D, at: Vector3, size: Vector3) -> StaticBody3D:
	var body := StaticBody3D.new()
	var collider := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = size
	collider.shape = shape
	body.add_child(collider)
	parent.add_child(body)
	body.position = at
	return body

func run_probe() -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://content.json"))
	var expected: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://expected.json"))
	var counts_match: bool = data.technicians.size() == expected.technicians \
		and data.scenes.size() == expected.scenes \
		and data.world.routes.size() == expected.routes \
		and data.world.portals.size() == expected.portals \
		and data.world.regions.size() == expected.regions
	for scene_id in expected.sceneIds:
		counts_match = counts_match and data.scenes.has(scene_id)
	check(counts_match, "current browser content loads in Godot with matching counts and scene IDs")
	check(data == JSON.parse_string(JSON.stringify(data)), "all imported content survives a Godot JSON round trip")

	var packed := load("res://unit-cube.glb") as PackedScene
	check(packed != null, "binary glTF imports as a PackedScene")
	if packed != null:
		var instance := packed.instantiate()
		root.add_child(instance)
		var meshes := instance.find_children("*", "MeshInstance3D", true, false)
		check(meshes.size() == 1 and meshes[0].get_aabb().size.is_equal_approx(Vector3.ONE), \
			"imported cube retains one-metre mesh dimensions")
		instance.queue_free()

	var room := Node3D.new()
	root.add_child(room)
	add_box(room, Vector3(0, -0.1, 0), Vector3(12, 0.2, 12))
	var workbench := add_box(room, Vector3(2, 0.5, 0), Vector3(1, 1, 1))
	var player := CharacterBody3D.new()
	var collider := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.3
	capsule.height = 1.6
	collider.shape = capsule
	player.add_child(collider)
	room.add_child(player)
	player.position = Vector3(0, 0.85, 0)
	await physics_frame
	await physics_frame
	var collision := player.move_and_collide(Vector3(4, 0, 0))
	check(collision != null and collision.get_collider() == workbench \
		and player.position.x < 1.21, "capsule movement stops at a solid 3D workbench")

	var query := PhysicsRayQueryParameters3D.create(Vector3(0, 0.5, 0), Vector3(4, 0.5, 0))
	query.exclude = [player.get_rid()]
	var hit := room.get_world_3d().direct_space_state.intersect_ray(query)
	query.from = Vector3(0, 0.5, 2)
	query.to = Vector3(4, 0.5, 2)
	var clear := room.get_world_3d().direct_space_state.intersect_ray(query)
	check(not hit.is_empty() and hit.collider == workbench and clear.is_empty(), \
		"interaction sightline detects an obstruction and a clear path")

	# File format capability only. This does not run JS save migration or import
	# an existing user's career, and writes only within the temporary fixture.
	var career := {"version": 1, "areaId": "shop", "spawnId": "van_rear", \
		"tools": ["screwdriver"], "flags": {"shopBrief": true}, "cash": 42}
	var file := FileAccess.open("res://probe-save.json", FileAccess.WRITE)
	check(file != null, "isolated JSON save file opens for writing")
	if file != null:
		file.store_string(JSON.stringify(career))
		file.close()
		var restored: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://probe-save.json"))
		# JSON numbers load as floats. Production save schemas must normalize
		# their typed fields instead of comparing raw Variant dictionaries.
		check(restored is Dictionary and int(restored.version) == career.version \
			and restored.areaId == career.areaId and restored.spawnId == career.spawnId \
			and restored.tools == career.tools and restored.flags == career.flags \
			and int(restored.cash) == career.cash, \
			"representative career IDs and flags survive disk save/load with numeric normalization")
	room.queue_free()
	await process_frame
	if failures == 0:
		print("GODOT_FEASIBILITY_PASSED")
	quit(0 if failures == 0 else 1)
