describe('ScoreModel', function() {
	beforeEach(	function() {
		this.scoreModel = new ScoreModel();        
        this.spy = jasmine.createSpy( 'updateCallback' );
	});

	describe('#setScore()', function () {
		it('should invoke callback', function () {
            this.scoreModel.onUpdate( this.spy );
            this.scoreModel.setScore(0, 15);
            expect( this.spy.calls.count() ).toEqual( 1 );
		});
	});
    
	describe('#getScore()', function () {
		it('should set and get the first score value ', function () {
            this.scoreModel.setScore(0, 15);
			expect( this.scoreModel.getScore( 0 ) ).toEqual( 15 );
		});
		it('should set and get a sparse score value ', function () {
            this.scoreModel.setScore(1, 15);
			expect( this.scoreModel.getScore( 1 ) ).toEqual( 15 );
		});
	});
    
	describe('#getAllScore()', function () {
		it('should return array for single value', function () {
            this.scoreModel.setScore(0, 15);
			expect( this.scoreModel.getAllScores() ).toEqual( [ 15 ] );
		});
		it('should return array for multiple value', function () {
            this.scoreModel.setScore(0, 15);
            this.scoreModel.setScore(1, 30);
			expect( this.scoreModel.getAllScores() ).toEqual( [ 15, 30 ] );
		});
		it('should set and get a sparse score value ', function () {
            this.scoreModel.setScore(1, 15);
			expect( this.scoreModel.getAllScores().length ).toEqual( 2 );
			expect( this.scoreModel.getAllScores()[0] ).not.toBeDefined();
			expect( this.scoreModel.getAllScores()[1] ).toEqual( 15 );
		});
	});
	describe('#incrementScore()', function () {
		it('should increment a single value', function () {
            this.scoreModel.setScore( 0, 15 );
            this.scoreModel.incrementScore( 0, 10 );
			expect( this.scoreModel.getScore( 0 ) ).toEqual( 25 );
		});
		it('should decrement when given negative values', function () {
            this.scoreModel.setScore( 0, 15 );
            this.scoreModel.incrementScore( 0, -10 );
			expect( this.scoreModel.getScore( 0 ) ).toEqual( 5 );
		});
		it('should set and get a sparse score value ', function () {
            this.scoreModel.setScore(1, 15);
			expect( this.scoreModel.getScore( 1 ) ).toEqual( 15 );
		});
	});
	describe('#get/setAttackMultiplier()', function () {
		it('should set and get the attack mulitplier', function () {
            this.scoreModel.setAttackMultiplier( 15 );
			expect( this.scoreModel.getAttackMultiplier() ).toEqual( 15 );
		});
    });
});
